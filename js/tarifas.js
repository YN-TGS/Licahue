/* ============================================================================
   Tarifas de Hotel y Cabañas Licahue

   Lee datos/tarifas.json y reemplaza con él los precios de la página.

   Para cambiar precios: editar datos/tarifas.json. No tocar index.html.

   El HTML ya trae los mismos valores escritos a mano. Este script los
   reemplaza cuando puede; si no puede, la página se ve igual con el respaldo.
   Por eso nunca queda una tabla de precios en blanco.

   Cuándo NO puede: al abrir index.html con doble clic, el navegador bloquea
   fetch() sobre file:// por seguridad. Para probar el JSON hay que servir la
   carpeta por HTTP — el archivo probar.bat lo hace.
   ========================================================================= */

(function () {
  'use strict';

  var RUTA = 'datos/tarifas.json';

  var ICONOS = {
    reloj:  'M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.9 8.3-3 1.8-.8-1.3 2.4-1.4V3.4h1.4z',
    aviso:  'M8 .8 1 13.9h14L8 .8zm.7 10.4H7.3V9.8h1.4zm0-2.6H7.3V5.2h1.4z',
    volver: 'M8 2.2A5.8 5.8 0 1 0 13.8 8h-1.5A4.3 4.3 0 1 1 8 3.7V6l3.2-2.6L8 .8z'
  };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function icono(d, clase) {
    return '<svg class="icono' + (clase ? ' ' + clase : '') + '" viewBox="0 0 16 16" ' +
           'aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>';
  }

  function crear(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content;
  }

  document.addEventListener('DOMContentLoaded', function () {
    fetch(RUTA)
      .then(function (r) {
        if (!r.ok) throw new Error('respuesta ' + r.status);
        return r.json();
      })
      .then(pintar)
      .catch(function (e) {
        // Silencioso a propósito: el respaldo del HTML ya está a la vista.
        if (window.console) {
          console.info('Tarifas: se usa el respaldo del HTML (' + e.message + ').');
        }
      });
  });

  function pintar(datos) {
    var precio = function (n) {
      return datos.simbolo + n.toLocaleString('es-CL');
    };

    // ---- encabezado de la sección -----------------------------------------
    var periodo = document.getElementById('tarifas-periodo');
    if (periodo && datos.temporada) periodo.textContent = datos.temporada;

    var nota = document.getElementById('tarifas-nota');
    if (nota && datos.nota) nota.innerHTML = datos.nota;

    // ---- tabla de precios de cada alojamiento -----------------------------
    (datos.alojamientos || []).forEach(function (a) {
      var tabla = document.getElementById('precios-' + a.id);
      if (!tabla) return;

      var encabezados = (datos.meses || []).map(function (m) {
        return '<th scope="col">' + esc(m) + '</th>';
      }).join('');

      var filas = (a.filas || []).map(function (f) {
        var celdas = (f.precios || []).map(function (p) {
          return '<td>' + esc(precio(p)) + '</td>';
        }).join('');
        return '<tr><th scope="row">' + esc(f.etiqueta) + '</th>' + celdas + '</tr>';
      }).join('');

      tabla.innerHTML =
        '<caption>Valor por noche</caption>' +
        '<thead><tr><th scope="col"><span class="vo">' + esc(a.encabezado || 'Tipo') +
        '</span></th>' + encabezados + '</tr></thead>' +
        '<tbody>' + filas + '</tbody>';

      // «Desde $X por noche» en la sección de alojamientos.
      // Se calcula del mismo dato, así no puede quedar desfasado.
      var destino = document.querySelector('[data-desde="' + a.id + '"]');
      if (destino) {
        var todos = (a.filas || []).reduce(function (acc, f) {
          return acc.concat(f.precios || []);
        }, []);
        if (todos.length) {
          destino.innerHTML = 'Desde <strong>' + esc(precio(Math.min.apply(null, todos))) +
                              '</strong> por noche';
        }
      }
    });

    // ---- servicios adicionales -------------------------------------------
    var extras = document.getElementById('extras');
    if (extras && datos.extras) {
      extras.innerHTML = '';
      datos.extras.forEach(function (x) {
        var figura = x.imagen
          ? '<figure class="extra__figura"><img src="' + esc(x.imagen) + '" width="' +
            esc(x.ancho || 1000) + '" height="' + esc(x.alto || 671) + '" loading="lazy" alt="' +
            esc(x.alt || x.nombre) + '"></figure>'
          : '';

        var lineas = (x.precios || []).map(function (p) {
          return '<p class="extra__precio"><strong>' + esc(precio(p.valor)) + '</strong> ' +
                 esc(p.detalle) + '</p>';
        }).join('');

        extras.appendChild(crear(
          '<article class="extra' + (x.imagen ? '' : ' extra--sin-foto') + '">' +
            figura +
            '<div class="extra__cuerpo">' +
              '<h4 class="extra__nombre">' + esc(x.nombre) + '</h4>' +
              lineas +
              (x.nota ? '<p class="extra__nota">' + esc(x.nota) + '</p>' : '') +
            '</div>' +
          '</article>'
        ));
      });
    }

    // ---- condiciones comunes ---------------------------------------------
    var condiciones = document.getElementById('condiciones');
    if (condiciones && datos.condiciones) {
      condiciones.innerHTML = '';
      datos.condiciones.forEach(function (c) {
        condiciones.appendChild(crear(
          '<p class="condicion">' + icono(ICONOS[c.icono] || ICONOS.aviso) +
          '<span>' + c.texto + '</span></p>'
        ));
      });
    }
  }
})();
