(() => {
  'use strict';

  /* ============ CONFIGURACIÓN: edita solo este bloque ============ */
  const CONFIG = {
    nombreEvento: 'Baby Shower de Domenico',
    fechaEvento: '2026-10-24T15:00:00-04:00',      // hora de La Paz, Bolivia (UTC-4)
    urlMaps: 'https://www.google.com/maps/place/Juan+Manuel+Caceres+1823,+La+Paz/@-16.5111821,-68.1379261,20.25z/data=!4m6!3m5!1s0x915f207e8892d807:0xf13a2733fc0c3fc0!8m2!3d-16.5110299!4d-68.1379799!16s%2Fg%2F11yr_gw44m!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MTAwNy4wIKXMDSoASAFQAw%3D%3D',
    urlScriptGoogle: 'https://script.google.com/macros/s/AKfycbyiyGD8_CdwD6pCNDbwfwwPJvL2OWalIH2dyUJ5cDLEeEFleyZGnRwuE3t4Cz_tRJv3/exec'
  };
  /* =============================================================== */

  const $ = (s) => document.querySelector(s);
  const dos = (n) => String(n).padStart(2, '0');
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
                 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  // Fecha y hora tal como se escribieron (sin depender de la zona horaria del visitante)
  const [anio, mes, dia, hh, mm] = CONFIG.fechaEvento.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/).slice(1).map(Number);
  const diaSemana = DIAS[new Date(anio, mes - 1, dia).getDay()];

  /* ---------- Imágenes que falten: se ocultan sin romper el diseño ---------- */
  document.querySelectorAll('img').forEach((img) => {
    const ocultar = () => img.classList.add('sin-imagen');
    img.addEventListener('error', ocultar);
    if (img.complete && img.naturalWidth === 0) ocultar();
  });

  /* ---------- Textos de fecha, hora y mapa ---------- */
  $('#f-mes').textContent = MESES[mes - 1];
  $('#f-sem').textContent = diaSemana;

  $('#f-dia').textContent = dos(dia);
  $('#f-hora').textContent = `${hh % 12 || 12}:${dos(mm)} ${hh < 12 ? 'a.m.' : 'p.m.'}`;
  $('#btn-maps').href = CONFIG.urlMaps;

  /* ---------- Cuenta regresiva ---------- */
  const meta = new Date(CONFIG.fechaEvento).getTime();
  const reloj = { d: $('#cd-d'), h: $('#cd-h'), m: $('#cd-m'), s: $('#cd-s') };
  function actualizarReloj() {
    let resto = Math.max(0, Math.floor((meta - Date.now()) / 1000));
    reloj.d.textContent = dos(Math.floor(resto / 86400));
    reloj.h.textContent = dos(Math.floor((resto % 86400) / 3600));
    reloj.m.textContent = dos(Math.floor((resto % 3600) / 60));
    reloj.s.textContent = dos(resto % 60);
    return resto;
  }
  if (actualizarReloj() > 0) {
    const t = setInterval(() => { if (actualizarReloj() === 0) clearInterval(t); }, 1000);
  }

  /* ---------- Calendario del mes del evento (semana inicia en lunes) ---------- */
  $('#cal-t').textContent = `${dos(dia)} ${MESES[mes - 1]} ${anio}`;
  const grid = $('#cal-g');
  ['L', 'M', 'M', 'J', 'V', 'S', 'D'].forEach((l) => {
    const e = document.createElement('span'); e.className = 'sem'; e.textContent = l; grid.appendChild(e);
  });
  const vacios = (new Date(anio, mes - 1, 1).getDay() + 6) % 7;
  for (let i = 0; i < vacios; i++) grid.appendChild(document.createElement('span'));
  for (let d = 1, total = new Date(anio, mes, 0).getDate(); d <= total; d++) {
    const e = document.createElement('span');
    e.textContent = d;
    if (d === dia) { e.className = 'evento'; e.setAttribute('aria-label', `${d}, día del evento`); }
    grid.appendChild(e);
  }

  /* ---------- Confirmación de asistencia ---------- */
  const form = $('#form-rsvp');
  const estado = $('#estado');
  const boton = form.querySelector('.btn-enviar');
  const CLAVE = 'rsvp-baby-domenico';
  let enviando = false;

  const mostrar = (msg, error = false) => { estado.textContent = msg; estado.classList.toggle('error', error); };
  const bloquear = (si) => {
    form.querySelectorAll('input:not(.trampa), button.btn-enviar').forEach((el) => { el.disabled = si; });
  };
  const agradecer = (nombre, asistencia) => {
    estado.classList.remove('error');
    estado.textContent = asistencia === 'Sí'
      ? `¡Gracias, ${nombre}! Tu asistencia quedó confirmada.`
      : `Gracias por avisarnos, ${nombre}. ¡Te enviamos un abrazo!`;
    const cambiar = document.createElement('button');
    cambiar.type = 'button';
    cambiar.textContent = 'Cambiar mi respuesta';
    cambiar.addEventListener('click', () => {
      try { localStorage.removeItem(CLAVE); } catch (_) {}
      bloquear(false); mostrar('');
    });
    estado.appendChild(document.createElement('br'));
    estado.appendChild(cambiar);
    bloquear(true);
  };

  // Si ya respondió antes en este dispositivo, se muestra el agradecimiento
  try {
    const previo = JSON.parse(localStorage.getItem(CLAVE) || 'null');
    if (previo) { form.nombre.value = previo.nombre; agradecer(previo.nombre, previo.asistencia); }
  } catch (_) {}

  /* Envío a Google Apps Script.
     Si tu script espera otros nombres de campo, cámbialos solo aquí. */
  async function enviarAGoogle(datos) {
    const ctrl = new AbortController();
    const limite = setTimeout(() => ctrl.abort(), 15000);
    try {
      // 'no-cors': Apps Script no devuelve cabeceras CORS; la respuesta es opaca,
      // por eso se considera enviado si no hubo error de red.
      // Mismo formato que tu código original: JSON enviado como text/plain.
      await fetch(CONFIG.urlScriptGoogle, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(datos),
        signal: ctrl.signal
      });
    } finally {
      clearTimeout(limite);
    }
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (enviando) return;

    const nombre = form.nombre.value.trim().replace(/\s+/g, ' ');
    const opcion = form.querySelector('input[name="asistencia"]:checked');

    if (nombre.length < 2) { mostrar('Escribe tu nombre para continuar.', true); form.nombre.focus(); return; }
    if (!opcion) { mostrar('Elige si nos acompañarás o no.', true); return; }
    if (form.web.value) { agradecer(nombre, opcion.value); return; }   // trampa anti-spam
    if (!CONFIG.urlScriptGoogle || CONFIG.urlScriptGoogle.includes('PEGA_AQUI')) {
      mostrar('La confirmación aún no está conectada. Avisa a los anfitriones.', true);
      console.warn('Falta configurar CONFIG.urlScriptGoogle en js/script.js');
      return;
    }

    enviando = true; boton.disabled = true; mostrar('Enviando…');
    try {
      await enviarAGoogle({
        nombre: nombre,
        confirmacion: opcion.value
      });
      try { localStorage.setItem(CLAVE, JSON.stringify({ nombre, asistencia: opcion.value })); } catch (_) {}
      agradecer(nombre, opcion.value);
    } catch (err) {
      console.error(err);
      mostrar('No pudimos enviar tu respuesta. Revisa tu conexión e inténtalo de nuevo.', true);
      boton.disabled = false;
    } finally {
      enviando = false;
    }
  });

  /* ---------- Pantalla del sobre y música ---------- */
  const intro = $('#intro');
  const musica = $('#musica');
  const btnMusica = $('#btn-musica');
  const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let abierta = false;
  let sinAudio = false;

  function pintarMusica() {
    const suena = !musica.paused;
    btnMusica.classList.toggle('silencio', !suena);
    btnMusica.setAttribute('aria-pressed', String(suena));
    btnMusica.setAttribute('aria-label', suena ? 'Pausar música' : 'Activar música');
  }
  musica.addEventListener('play', pintarMusica);
  musica.addEventListener('pause', pintarMusica);
  musica.addEventListener('error', () => { sinAudio = true; btnMusica.hidden = true; });
  btnMusica.addEventListener('click', () => {
    if (musica.paused) musica.play().catch(() => {}); else musica.pause();
  });

  function abrirInvitacion() {
    if (abierta) return;
    abierta = true;
    $('#btn-abrir').disabled = true;

    // La música debe iniciarse dentro del click para que el navegador la permita
    musica.volume = 0.7;
    const p = musica.play();
    if (p && p.catch) p.catch(() => {});

    intro.classList.add('abierto');                                   // se abre el sobre
    setTimeout(() => intro.classList.add('saliendo'), reducir ? 0 : 1600);   // se desvanece
    setTimeout(() => {
      intro.hidden = true;
      document.documentElement.classList.remove('bloqueado');
      window.scrollTo(0, 0);
      if (!sinAudio) btnMusica.hidden = false;
      pintarMusica();
      $('#invitacion').focus({ preventScroll: true });
    }, reducir ? 0 : 2500);
  }
  $('#btn-abrir').addEventListener('click', abrirInvitacion);
  $('#sobre').addEventListener('click', abrirInvitacion);
  $('#sobre').style.cursor = 'pointer';
})();
