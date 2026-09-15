/* ============================================================================
   Visor de fotos de la galería

   Al tocar una miniatura, la foto se abre flotando sobre la página, con el
   fondo oscurecido. Se cierra con la X, con Escape, o tocando fuera de la foto.
   Las flechas del teclado y los botones laterales pasan a la anterior o la
   siguiente.

   Está hecho con el elemento <dialog> del navegador: el fondo, el atrapado del
   foco y la tecla Escape son nativos, así que no hace falta ninguna librería.

   Si el navegador no lo soporta o el script no carga, cada miniatura sigue
   siendo un enlace normal a su foto y se abre en una pestaña. La galería nunca
   queda inservible.
   ========================================================================= */

(function () {
  'use strict';

  var rejilla = document.querySelector('.galeria__rejilla');
  var visor = document.getElementById('visor');
  if (!rejilla || !visor || typeof visor.showModal !== 'function') return;

  var foto = visor.querySelector('.visor__foto');
  var texto = visor.querySelector('.visor__texto');
  var contador = visor.querySelector('.visor__contador');
  var enlaces = Array.prototype.slice.call(rejilla.querySelectorAll('a'));
  var actual = 0;
  var disparador = null;

  function mostrar(i) {
    actual = (i + enlaces.length) % enlaces.length;
    var a = enlaces[actual];
    var img = a.querySelector('img');
    foto.src = a.getAttribute('href');
    foto.alt = img ? img.alt : '';
    texto.textContent = img ? img.alt : '';
    contador.textContent = (actual + 1) + ' / ' + enlaces.length;
  }

  function abrir(i, origen) {
    disparador = origen || null;
    mostrar(i);
    document.documentElement.classList.add('visor-abierto');
    visor.showModal();
  }

  function cerrar() {
    if (visor.open) visor.close();
  }

  enlaces.forEach(function (a, i) {
    a.addEventListener('click', function (e) {
      // sin modificadores: abrimos el visor. Con Ctrl/Cmd o botón central,
      // dejamos que el navegador abra la foto en otra pestaña, como siempre.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      abrir(i, a);
    });
  });

  visor.addEventListener('close', function () {
    document.documentElement.classList.remove('visor-abierto');
    foto.removeAttribute('src');
    if (disparador) {
      disparador.focus();
      disparador = null;
    }
  });

  // tocar fuera de la foto cierra
  visor.addEventListener('click', function (e) {
    if (e.target === visor) cerrar();
  });

  visor.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); mostrar(actual + 1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); mostrar(actual - 1); }
  });

  visor.querySelector('.visor__cerrar').addEventListener('click', cerrar);
  visor.querySelector('.visor__antes').addEventListener('click', function () { mostrar(actual - 1); });
  visor.querySelector('.visor__luego').addEventListener('click', function () { mostrar(actual + 1); });
})();
