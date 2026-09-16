/* ============================================================================
   Formulario de solicitud de reserva

   El formulario del HTML ya funciona solo: es un <form> normal que envía los
   datos a FormSubmit, el mismo servicio que usa El Mundo de Rafa. Si este
   script no carga, el visitante igual puede enviar su solicitud; lo que pasa
   es que sale de la página y aterriza en la hoja de gracias de FormSubmit.

   Lo que agrega el script:
     1. Envía sin salir de la página y muestra la respuesta ahí mismo.
     2. No deja elegir una salida anterior a la llegada.
     3. Marca en rojo los campos incompletos recién después de intentar enviar,
        no mientras el visitante escribe.

   El correo de destino NO se configura aquí: sale del atributo action del
   formulario, en index.html. Este script solo le agrega /ajax/.
   ========================================================================= */

(function () {
  'use strict';

  var formulario = document.querySelector('.formulario');
  if (!formulario) return;

  var estado = formulario.querySelector('.formulario__estado');
  var boton = formulario.querySelector('.formulario__enviar');
  var llegada = formulario.querySelector('#f-llegada');
  var salida = formulario.querySelector('#f-salida');

  /* --- fechas: nada anterior a hoy, y la salida después de la llegada --- */

  function hoy() {
    var d = new Date();
    var mes = ('0' + (d.getMonth() + 1)).slice(-2);
    var dia = ('0' + d.getDate()).slice(-2);
    return d.getFullYear() + '-' + mes + '-' + dia;
  }

  function diaSiguiente(fecha) {
    var d = new Date(fecha + 'T12:00:00');
    if (isNaN(d.getTime())) return fecha;
    d.setDate(d.getDate() + 1);
    var mes = ('0' + (d.getMonth() + 1)).slice(-2);
    var dia = ('0' + d.getDate()).slice(-2);
    return d.getFullYear() + '-' + mes + '-' + dia;
  }

  if (llegada && salida) {
    llegada.min = hoy();
    salida.min = diaSiguiente(hoy());

    llegada.addEventListener('change', function () {
      if (!llegada.value) return;
      salida.min = diaSiguiente(llegada.value);
      if (salida.value && salida.value <= llegada.value) salida.value = '';
    });
  }

  /* --- los campos incompletos se marcan recién al intentar enviar --- */

  formulario.addEventListener('invalid', function () {
    formulario.setAttribute('data-intentado', '');
  }, true);

  /* --- envío sin salir de la página --- */

  function mostrar(texto, esError) {
    if (!estado) return;
    estado.textContent = texto;
    estado.className = 'formulario__estado' + (esError ? ' formulario__estado--error' : '');
    estado.hidden = false;
  }

  // Si al navegador le falta algo de esto, se deja el envío normal del <form>.
  if (typeof window.fetch !== 'function' || typeof window.FormData !== 'function') return;

  var destino = formulario.getAttribute('action').replace('formsubmit.co/', 'formsubmit.co/ajax/');

  formulario.addEventListener('submit', function (evento) {
    formulario.setAttribute('data-intentado', '');
    if (!formulario.checkValidity()) return;   // el navegador muestra sus avisos

    evento.preventDefault();
    if (boton) boton.disabled = true;
    mostrar('Enviando su solicitud...', false);

    fetch(destino, {
      method: 'POST',
      body: new FormData(formulario),
      headers: { 'Accept': 'application/json' }
    }).then(function (respuesta) {
      if (!respuesta.ok) throw new Error('respuesta ' + respuesta.status);
      return respuesta.json();
    }).then(function (datos) {
      // FormSubmit explica en datos.message por qué rechazó un envío — por
      // ejemplo, que la casilla todavía no está confirmada. Al visitante se le
      // muestra un aviso en español; el motivo real queda en la consola, que es
      // donde hace falta al configurar.
      if (String(datos.success) !== 'true') throw new Error(datos.message || 'sin confirmación');
      formulario.reset();
      formulario.removeAttribute('data-intentado');
      if (llegada && salida) salida.min = diaSiguiente(hoy());
      mostrar('Gracias, recibimos su solicitud. Le respondemos a la brevedad al correo que dejó.', false);
      if (boton) boton.disabled = false;
    })['catch'](function (error) {
      if (window.console && console.warn) console.warn('FormSubmit:', error && error.message);
      mostrar('No pudimos enviar el mensaje. Escríbanos por WhatsApp al +56 9 9779 7188 ' +
              'o a contacto@licahue.cl y lo vemos de inmediato.', true);
      if (boton) boton.disabled = false;
    });
  });

})();
