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
    volver: 'M8 2.2A5.8 5.8 0 1 0 13.8 8h-1.5A4.3 4.3 0 1 1 8 3.7V6l3.2-2.6L8 .8z',
    whatsapp: 'M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 1.8a8.2 8.2 0 1 1-4.2 15.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 0 1 12 3.8zm-3.1 4c-.2 0-.5 0-.7.4-.3.4-1 1-1 2.3s1 2.7 1.2 2.9c.1.2 2 3.1 4.9 4.2 2.4.9 2.9.8 3.4.7.5 0 1.6-.6 1.8-1.3.2-.6.2-1.2.2-1.3l-.6-.3-1.7-.8c-.2-.1-.4-.2-.6.1l-.8 1c-.2.2-.3.2-.5.1-.3-.1-1.2-.5-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.2 0-.4.1-.5l.4-.5.3-.5v-.5l-.8-1.9c-.2-.5-.4-.4-.6-.5h-.4z'
  };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function icono(d, clase) {
    var caja = d.indexOf('M12 2a10') === 0 ? '0 0 24 24' : '0 0 16 16';
    return '<svg class="icono' + (clase ? ' ' + clase : '') + '" viewBox="' + caja + '" ' +
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

    // ---- oferta destacada -------------------------------------------------
    var oferta = document.getElementById('oferta');
    if (oferta) {
      var o = datos.oferta;
      if (!o || !o.activa) {
        // Basta con poner activa:false en el JSON para bajarla del sitio.
        oferta.hidden = true;
      } else {
        oferta.hidden = false;
        var valores = (o.valores || []).map(function (v) {
          return '<div class="oferta__valor">' +
                   '<span class="oferta__nombre">' + esc(v.nombre) + '</span>' +
                   '<p class="oferta__detalle">' + esc(v.detalle) + '</p>' +
                   '<p class="oferta__total">' + esc(precio(v.total)) + '</p>' +
                 '</div>';
        }).join('');

        var wa = 'https://wa.me/' + esc(o.whatsapp || '') +
                 '?text=' + encodeURIComponent('Hola, quiero reservar la oferta de ' + (o.titulo || ''));

        oferta.innerHTML =
          '<div class="oferta__cabecera">' +
            '<span class="oferta__etiqueta">' + esc(o.etiqueta || 'Oferta') + '</span>' +
            '<span class="oferta__titulo" id="t-oferta">' + esc(o.titulo) + '</span>' +
            '<p class="oferta__bajada">' + esc(o.bajada) + '</p>' +
          '</div>' +
          '<div class="oferta__valores">' + valores + '</div>' +
          '<div class="oferta__pie">' +
            '<p class="oferta__nota">' + esc(o.nota || '') + '</p>' +
            '<a class="boton boton--whatsapp" href="' + wa + '" target="_blank" rel="noopener">' +
              icono(ICONOS.whatsapp) +
              '<span>' + esc(o.reservas || 'Reservar por WhatsApp') + '</span>' +
            '</a>' +
          '</div>';
      }
    }

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
