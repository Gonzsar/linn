/* ═══════════════════════════════════════════════════════
   DÍA DEL LECTOR — Nuestra Historia
   Motor de la historia: libro, capítulos, narración,
   parallax, deseo y carta.
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═════════ GUION ═════════ */

  var CHAPTERS = {
    1: [
      { t: '14 de noviembre de 2025. Un dia en un servidor cualquiera de MIC UP.' },
      { t: 'Te vi junto a mí, estábamos viendo a gente y te pusiste a mi lado, tenía muchas ganas de hablarte.' },
      { t: 'No lo hice, obviamente.' },
      { t: 'Lo que sí hice fue correr por el mapa y meterme en la jaula de la esquina y quedarme atascado adentro.' },
      { t: 'Con la intención de que me vieras y vengas hacia mí.' },
      { a: 'cage' },
      { t: '«Parecés una mosca», me dijiste. Y te reíste.' },
      { t: 'Ahí ya supe que me ibas a caer bien.' },
      { t: 'Todo esto empezó conmigo haciendo el ridículo delante tuyo. Un comienzo perfecto si me preguntas.', hs: true }
    ],
    2: [
      { t: 'Al principio hablábamos solo adentro de Roblox. Yo hablaba y tu me escribías, hasta que hablaste vos también.' },
      { t: 'Después nos pasamos a Discord. Y ya no hubo tema que no habláramos, eran siempre conversaciones interesantes.' },
      { a: 'chat' },
      { t: 'De tu día. Del mío. De cosas que uno no le cuenta a cualquiera.' },
      { t: 'Y hay algo que nunca te dije así de directo, aunque ahora ya lo sabes de hace tiempo... me encanta tu voz.' },
      { t: 'Creo que por eso las llamadas se hacían tan largas. No era el tema, es que me encanta escucharte.', hs: true }
    ],
    3: [
      { t: 'Con el Genshin te costó al principio jugar conmigo. No te gustaba el multijugador.' },
      { t: 'Pero te insistí tanto con jugar que al final te enganchaste.' },
      { a: 'party' },
      { t: 'Mi favoritismo con Hu Tao desde que salió, hace años.' },
      { t: 'Vos con Flins desde que apareció Nod’Krai, osea desde que comenzaste a jugar.' },
      { t: 'Pero en nuestros mundos siempre terminábamos igual: vos con Columbina e Ineffa, yo con Chasca y Furina.' },
      { t: 'No sé por qué pero me da gracia jajaj.' },
      { t: 'Espera... Y eso??' },
      { a: 'wish' },
      { t: 'Ese fue mi granito de suerte para que te salga Flins C3 o al menos C2 jiji' },
      { t: 'Era buenísimo cuando nos salia un 5★ y nos lo mostrábamos el uno al otro, para que el otro tenga envidia, obvio.' },
      { t: 'Jefes semanales, explorar de todo, vos estresándote en el Xbox, los dos en llamada escuchando música, bueno, tus conciertos.' },
      { t: 'Horas y horas haciendo básicamente nada. Y estaba perfecto, siempre.', hs: true }
    ],
    4: [
      { t: 'En total jugamos dos juegos prácticamente. Roblox y Genshin.' },
      { t: 'Escrito así suena a poco, pero no lo fue ni un poquito.' },
      { a: 'shelf' },
      { t: 'Y todavía quedan cosas sin abrir, que nos esperan. Tocalas si querés.' },
      { t: 'Esta lista existe porque doy por hecho que va a haber más.', hs: true }
    ]
  };

  var CHAT = [
    { who: 'linn', name: 'Linn', t: 'Hello estas?' },
    { who: 'gon',  name: 'Gon',  t: 'sisi, te llamo?' },
    { who: 'linn', name: 'Linn', t: 'Si quieres si' },
    { who: 'gon',  name: 'Gon',  t: 'Dale' }
  ];

  var LAST = 5;

  /* ═════════ AUDIO ═════════ */

  var bgm = $('#bgm');
  var muteBtn = $('#muteBtn');
  var muted = false;

  function playMusic() {
    if (!bgm) return;
    bgm.volume = 0;
    var p = bgm.play();
    if (p && p.catch) p.catch(function () { /* el navegador puede bloquear: no pasa nada */ });
    var target = 0.55, t0 = performance.now();
    (function fade(now) {
      var k = Math.min(1, (now - t0) / 2600);
      if (!muted) bgm.volume = target * k;
      if (k < 1) requestAnimationFrame(fade);
    })(t0);
    muteBtn.hidden = false;
  }

  muteBtn.addEventListener('click', function () {
    muted = !muted;
    muteBtn.classList.toggle('is-muted', muted);
    muteBtn.setAttribute('aria-label', muted ? 'Activar música' : 'Silenciar música');
    if (bgm) bgm.muted = muted;
  });

  /* ═════════ PARTÍCULAS AMBIENTE ═════════ */

  function seedRand(seed) {
    var s = seed * 9301 + 49297;
    return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }

  function makeMotes(host, count, opt) {
    if (!host || reduce) return;
    opt = opt || {};
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var d = document.createElement('span');
      d.className = 'dust';
      var size = (opt.min || 2) + Math.random() * (opt.range || 4);
      var dur = (opt.dur || 16) + Math.random() * 16;
      d.style.cssText =
        'width:' + size.toFixed(1) + 'px;height:' + size.toFixed(1) + 'px;' +
        'left:' + (Math.random() * 100).toFixed(2) + '%;' +
        'bottom:-14px;' +
        'animation-duration:' + dur.toFixed(1) + 's;' +
        'animation-delay:-' + (Math.random() * dur).toFixed(1) + 's;';
      frag.appendChild(d);
    }
    host.appendChild(frag);
  }

  makeMotes($('#deskDust'), 30, { min: 2, range: 4, dur: 15 });
  makeMotes($('#letterMotes'), 18, { min: 2, range: 3, dur: 20 });

  /* estrellas SVG */
  $$('.starfield').forEach(function (g) {
    var n = parseInt(g.getAttribute('data-stars'), 10) || 80;
    var rnd = seedRand(parseInt(g.getAttribute('data-seed'), 10) || 1);
    var vb = g.ownerSVGElement.getAttribute('viewBox').split(' ');
    var W = parseFloat(vb[2]), H = parseFloat(vb[3]);
    var out = '';
    for (var i = 0; i < n; i++) {
      var x = (rnd() * W).toFixed(1);
      var y = (rnd() * H * 0.72).toFixed(1);
      var r = (0.5 + rnd() * 1.7).toFixed(2);
      var dur = (2 + rnd() * 4).toFixed(2);
      var del = (-rnd() * 6).toFixed(2);
      var op = (0.35 + rnd() * 0.6).toFixed(2);
      out += '<circle class="star" cx="' + x + '" cy="' + y + '" r="' + r +
             '" opacity="' + op + '" style="animation-duration:' + dur + 's;animation-delay:' + del + 's"/>';
    }
    g.innerHTML = out;
  });

  /* ondas de voz */
  (function () {
    var wave = $('#dcWave');
    if (!wave) return;
    var out = '';
    for (var i = 0; i < 42; i++) {
      var h = 6 + Math.random() * 22;
      out += '<i style="height:' + h.toFixed(1) + 'px;animation-delay:-' + (Math.random() * 1.1).toFixed(2) + 's"></i>';
    }
    wave.innerHTML = out;
    var sheet = document.createElement('style');
    sheet.textContent = '@keyframes waveBar{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}';
    document.head.appendChild(sheet);
  })();

  /* ═════════ PARALLAX ═════════ */

  var px = { tx: 0, ty: 0, cx: 0, cy: 0 };

  function onMove(e) {
    var p = e.touches ? e.touches[0] : e;
    px.tx = (p.clientX / window.innerWidth - 0.5) * 2;
    px.ty = (p.clientY / window.innerHeight - 0.5) * 2;
  }
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });

  var t0 = performance.now();
  (function parallaxLoop(now) {
    var el = (now - t0) / 1000;
    px.cx += (px.tx - px.cx) * 0.055;
    px.cy += (px.ty - px.cy) * 0.055;
    var driftX = Math.sin(el * 0.19) * 0.28;
    var driftY = Math.cos(el * 0.14) * 0.18;
    var active = $('.chapter.is-active');
    if (active && !reduce) {
      $$('.layer', active).forEach(function (L) {
        // Las capas de interfaz no se mueven: si no, los botones flotan
        // unos 25px y se vuelven difíciles de acertar, sobre todo en celular.
        if (L.classList.contains('layer-ui')) return;
        var d = parseFloat(L.getAttribute('data-depth')) || 0;
        var x = (px.cx + driftX) * d * 30;
        var y = (px.cy + driftY) * d * 18;
        L.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0)';
      });
    }
    requestAnimationFrame(parallaxLoop);
  })(t0);

  /* ═════════ NARRADOR ═════════ */

  var narrator = $('#narrator'),
      narrCard = $('#narrCard'),
      narrWho  = $('#narrWho'),
      narrText = $('#narrText'),
      narrNext = $('#narrNext');

  var typing = null, pendingResolve = null;

  function typeOut(text, done) {
    if (typing) cancelAnimationFrame(typing.raf);
    narrText.textContent = '';
    var caret = document.createElement('span');
    caret.className = 'narr-caret';
    narrText.appendChild(caret);

    if (reduce) { narrText.textContent = text; typing = null; if (done) done(); return; }

    var i = 0, t0 = performance.now(), rate = 26;
    var state = {
      raf: 0,
      finish: function () {
        cancelAnimationFrame(state.raf);
        narrText.textContent = text;
        typing = null;
        if (done) done();
      }
    };
    function tick(now) {
      var target = Math.min(text.length, Math.floor((now - t0) / rate));
      if (target > i) {
        i = target;
        narrText.textContent = text.slice(0, i);
        narrText.appendChild(caret);
      }
      if (i >= text.length) { state.finish(); return; }
      state.raf = requestAnimationFrame(tick);
    }
    state.raf = requestAnimationFrame(tick);
    typing = state;
  }

  function showNarrator(on) {
    narrator.hidden = false;
    narrator.classList.toggle('is-hidden', !on);
  }

  /* ═════════ MOTOR DE CAPÍTULOS ═════════ */

  var cur = 0, beatIdx = 0, busy = false, seen = {};
  var story = $('#story');
  var turnSheet = $('#turnSheet');
  var dots = $$('.hud-progress .dot');
  var progress = $('#progress');

  function chapterEl(n) { return $('#ch' + n); }

  function markDots() {
    dots.forEach(function (d, i) {
      var n = i + 1;
      d.classList.toggle('on', n === cur);
      d.classList.toggle('seen', !!seen[n]);
    });
  }

  dots.forEach(function (d) {
    d.addEventListener('click', function () {
      var n = parseInt(d.getAttribute('data-go'), 10);
      if (!seen[n] || n === cur || busy) return;
      goTo(n);
    });
  });

  function goTo(n) {
    if (busy) return;
    busy = true;
    turnSheet.hidden = false;
    turnSheet.classList.add('is-on', 'turn-in');

    setTimeout(function () {
      turnSheet.classList.remove('turn-in');
      swap(n);
      turnSheet.classList.add('turn-out');
      setTimeout(function () {
        turnSheet.classList.remove('is-on', 'turn-out');
        busy = false;
      }, 560);
    }, reduce ? 60 : 470);
  }

  function swap(n) {
    var prev = chapterEl(cur);
    if (prev) { prev.classList.remove('is-active'); teardown(cur); }
    cur = n;
    seen[n] = true;
    markDots();
    var el = chapterEl(n);
    el.classList.add('is-active');
    setup(n);
  }

  /* ── acciones por capítulo ── */

  var game = null, chatTimer = null, callTimer = null;

  function setup(n) {
    var el = chapterEl(n);
    $$('.hs', el).forEach(function (h) { h.classList.remove('found'); });
    var hsWrap = $('.hotspots', el);
    if (hsWrap) hsWrap.classList.remove('is-live');
    var oldChip = $('.ch-find', el);
    if (oldChip) oldChip.classList.remove('on', 'done');

    // En el cap. 1 esperamos a que termine el minijuego: si no, los puntitos
    // se comerían los toques para saltar. En el resto, apenas entra.
    if (n !== 1) setTimeout(function () { if (cur === n) liveHotspots(n); }, 900);

    if (n === 1) {
      var cv = $('#cageCanvas');
      game = window.CageGame.mount(cv, {
        host: $('.scene-roblox'),
        onBonk: function (k, max) { renderPips(k, max); },
        onLinn: function (a) { showBubble(a); },
        onFree: function () { hideBubble(); },
        onDone: function () { endCage(); }
      });
      game.start();
      renderPips(0, 4);
    }

    if (n === 5) {
      showNarrator(false);
      var end = $('#letterEnd');
      end.hidden = true;
      setTimeout(function () { end.hidden = false; }, reduce ? 300 : 2600);
      beatIdx = 0;
      return;
    }

    beatIdx = 0;
    showNarrator(true);
    runBeat();
  }

  function teardown(n) {
    if (n === 1 && game) { game.destroy(); game = null; hideBubble(); }
    if (n === 2) {
      clearTimeout(chatTimer);
      clearInterval(callTimer);
      $('#dcPanel').classList.remove('on');
      $('#dcChat').innerHTML = '';
      $('#dcTime').textContent = '00:00';
    }
    if (n === 3) {
      $('#party').hidden = true;
      $('#wishBox').hidden = true;
    }
    if (n === 4) {
      $$('.gbox').forEach(function (b) { b.classList.remove('stamped'); });
    }
  }

  function runBeat() {
    var list = CHAPTERS[cur];
    if (!list) return;

    if (beatIdx >= list.length) {
      if (cur < LAST) goTo(cur + 1);
      return;
    }

    var b = list[beatIdx];

    if (b.hs) liveHotspots(cur);

    if (b.a) {
      showNarrator(false);
      runAction(b.a, function () {
        beatIdx++;
        showNarrator(true);
        runBeat();
      });
      return;
    }

    narrCard.setAttribute('data-who', b.who || 'narr');
    if (b.who) {
      narrWho.hidden = false;
      narrWho.textContent = b.who === 'linn' ? 'Linn' : 'Gon';
    } else {
      narrWho.hidden = true;
    }

    narrNext.hidden = true;
    typeOut(b.t, function () { narrNext.hidden = false; });
  }

  function advance() {
    if (busy) return;
    if (typing) { typing.finish(); return; }
    if (narrator.classList.contains('is-hidden')) return;
    if (narrNext.hidden) return;
    beatIdx++;
    runBeat();
  }

  narrCard.addEventListener('click', function (e) {
    if (e.target.closest('.narr-next') || e.target === narrCard || narrCard.contains(e.target)) advance();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeMem(); return; }
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
      if (body.classList.contains('is-story')) { e.preventDefault(); advance(); }
    }
  });

  /* ── acciones ── */

  function runAction(name, done) {
    if (name === 'cage')  return actCage(done);
    if (name === 'chat')  return actChat(done);
    if (name === 'party') return actParty(done);
    if (name === 'wish')  return actWish(done);
    if (name === 'shelf') return actShelf(done);
    done();
  }

  /* CAP 1 · la jaula */
  var cageDone = null;

  function renderPips(k, max) {
    var wrap = $('#rbxAttempts');
    if (!wrap) return;
    var out = '';
    for (var i = 0; i < max; i++) out += '<span class="att-pip' + (i < k ? ' on' : '') + '"></span>';
    wrap.innerHTML = out;
  }

  function actCage(done) {
    cageDone = done;
    $('#rbxUi').hidden = false;
    if (game) game.arm();
  }

  function endCage() {
    $('#rbxUi').hidden = true;
    liveHotspots(1);
    if (cageDone) { var d = cageDone; cageDone = null; d(); }
  }

  var bubbleEl = null;
  function showBubble(a) {
    hideBubble();
    var scene = $('.scene-roblox');
    bubbleEl = document.createElement('div');
    bubbleEl.className = 'rbx-bubble';
    bubbleEl.innerHTML = '<span class="who">Aislinn</span>jajaja parecés una mosca';
    scene.appendChild(bubbleEl);
    // Clampeo con el ancho real de la burbuja para que nunca se salga en celular.
    var r = scene.getBoundingClientRect();
    var bw = bubbleEl.offsetWidth, bh = bubbleEl.offsetHeight;
    var minX = bw / 2 + 12, maxX = r.width - bw / 2 - 12;
    var x = maxX < minX ? r.width / 2 : Math.min(Math.max(a.x, minX), maxX);
    bubbleEl.style.left = Math.round(x) + 'px';
    bubbleEl.style.top = Math.round(Math.max(bh + 76, a.y)) + 'px';
    requestAnimationFrame(function () { bubbleEl.classList.add('on'); });
    $('#rbxTapper').style.opacity = '0';
  }
  function hideBubble() {
    if (!bubbleEl) return;
    var b = bubbleEl; bubbleEl = null;
    b.classList.remove('on');
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 450);
  }

  /* CAP 2 · el chat */
  function actChat(done) {
    var panel = $('#dcPanel'), list = $('#dcChat');
    panel.classList.add('on');
    list.innerHTML = '';

    CHAT.forEach(function (m, i) {
      var li = document.createElement('li');
      li.className = 'dc-msg ' + m.who;
      li.style.animationDelay = (0.35 + i * 0.55) + 's';
      li.innerHTML =
        '<span class="dc-av">' + m.name.charAt(0) + '</span>' +
        '<span class="dc-bd"><b>' + m.name + '</b>' + m.t + '</span>';
      list.appendChild(li);
    });

    // el reloj de la llamada corre
    var secs = 0, target = 4 * 3600 + 37 * 60 + 2;
    var tEl = $('#dcTime');
    clearInterval(callTimer);
    callTimer = setInterval(function () {
      secs += Math.max(60, Math.round((target - secs) * 0.06));
      if (secs >= target) { secs = target; clearInterval(callTimer); }
      var h = Math.floor(secs / 3600), m = Math.floor(secs % 3600 / 60), s = secs % 60;
      tEl.textContent = h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }, 40);

    chatTimer = setTimeout(done, reduce ? 300 : 2700);
  }

  /* CAP 3 · el equipo */
  function actParty(done) {
    var p = $('#party');
    p.hidden = false;
    $$('.unit', p).forEach(function (u, i) { u.style.animationDelay = (i * 0.09) + 's'; });
    setTimeout(done, reduce ? 200 : 1250);
  }

  /* CAP 3 · el deseo */

  var wishOv = $('#wishOverlay'), woImg = $('#woImg');

  // Si assets/flins.png no está, se cae con gracia al emblema en vez de
  // mostrar un ícono de imagen rota.
  if (woImg) {
    woImg.addEventListener('error', function () { wishOv.classList.add('no-img'); });
    woImg.addEventListener('load', function () { wishOv.classList.remove('no-img'); });
    if (woImg.complete && woImg.naturalWidth === 0) wishOv.classList.add('no-img');
  }

  // Estrellas del fondo y chispas electro: se arman una sola vez.
  (function buildWishFx() {
    var stars = $('#woStars'), sparks = $('#woSparks');
    if (stars) {
      var so = '';
      for (var i = 0; i < 90; i++) {
        var sz = (0.8 + Math.random() * 2).toFixed(2);
        so += '<span class="wo-star" style="' +
          'width:' + sz + 'px;height:' + sz + 'px;' +
          'left:' + (Math.random() * 100).toFixed(2) + '%;' +
          'top:' + (Math.random() * 92).toFixed(2) + '%;' +
          'animation-duration:' + (2 + Math.random() * 4).toFixed(2) + 's;' +
          'animation-delay:-' + (Math.random() * 6).toFixed(2) + 's"></span>';
      }
      stars.innerHTML = so;
    }
    if (sparks && !reduce) {
      var po = '';
      for (var j = 0; j < 30; j++) {
        var d = (3 + Math.random() * 8).toFixed(1);
        var dur = (4.5 + Math.random() * 5).toFixed(2);
        // concentradas alrededor del personaje
        var left = 50 + (Math.random() - 0.5) * 76;
        po += '<span class="wo-spark" style="' +
          'width:' + d + 'px;height:' + d + 'px;' +
          'left:' + left.toFixed(2) + '%;' +
          'bottom:' + (-6 + Math.random() * 24).toFixed(1) + '%;' +
          'animation-duration:' + dur + 's;' +
          'animation-delay:' + (2 + Math.random() * 6).toFixed(2) + 's"></span>';
      }
      sparks.innerHTML = po;
    }
  })();

  function actWish(done) {
    var box = $('#wishBox'), btn = $('#wishBtn'), ov = wishOv;
    $('#party').hidden = true;
    box.hidden = false;

    function launch() {
      btn.removeEventListener('click', launch);
      box.hidden = true;
      ov.hidden = false;
      ov.setAttribute('aria-hidden', 'false');

      // La secuencia completa dura ~3.7 s; recién ahí se puede cerrar,
      // así nadie se la saltea sin querer con el toque del botón.
      var armed = false;
      setTimeout(function () { armed = true; }, reduce ? 300 : 3800);

      function close() {
        if (!armed) return;
        ov.removeEventListener('pointerdown', close);
        ov.style.transition = 'opacity .7s ease';
        ov.style.opacity = '0';
        setTimeout(function () {
          ov.hidden = true;
          ov.setAttribute('aria-hidden', 'true');
          ov.style.opacity = '';
          ov.style.transition = '';
          $('#party').hidden = false;
          done();
        }, 700);
      }
      ov.addEventListener('pointerdown', close);
    }
    btn.addEventListener('click', launch);
  }

  /* CAP 4 · la estantería */
  function actShelf(done) {
    $$('.gbox').forEach(function (b) {
      b.addEventListener('click', function () { b.classList.add('stamped'); });
    });
    setTimeout(done, reduce ? 100 : 500);
  }

  /* ═════════ HOTSPOTS ═════════ */

  var memCard = $('#memCard'), memTitle = $('#memTitle'), memBody = $('#memBody');

  // El orbe, los anillos y la etiqueta se arman acá para no repetirlos
  // en el HTML: ahí solo viven data-title y data-body.
  $$('.hs').forEach(function (h) {
    h.innerHTML =
      '<span class="hs-ring"></span>' +
      '<span class="hs-ring r2"></span>' +
      '<span class="hs-dot"></span>' +
      '<span class="hs-tip"></span>';
    $('.hs-tip', h).textContent = h.getAttribute('data-title') || '';
    h.setAttribute('aria-label', 'Recuerdo: ' + (h.getAttribute('data-title') || ''));
    h.addEventListener('click', function () {
      h.classList.add('found');
      memTitle.textContent = h.getAttribute('data-title');
      memBody.textContent = h.getAttribute('data-body');
      memCard.hidden = false;
      updateFind(cur);
    });
  });

  // Contador "X de Y recuerdos" debajo del nombre del capítulo.
  function findChip(n) {
    var meta = $('.ch-meta', chapterEl(n));
    if (!meta) return null;
    var chip = $('.ch-find', meta);
    if (!chip) {
      chip = document.createElement('span');
      chip.className = 'ch-find';
      meta.appendChild(chip);
    }
    return chip;
  }

  function updateFind(n) {
    var el = chapterEl(n);
    if (!el) return;
    var all = $$('.hs', el);
    if (!all.length) return;
    var got = all.filter(function (h) { return h.classList.contains('found'); }).length;
    var chip = findChip(n);
    if (!chip) return;
    chip.innerHTML = got >= all.length
      ? '✦ los encontraste todos'
      : '✦ <b>' + got + '/' + all.length + '</b> recuerdos — tocá los puntitos';
    chip.classList.toggle('done', got >= all.length);
  }

  // Enciende los puntitos del capítulo y muestra el contador.
  function liveHotspots(n) {
    var el = chapterEl(n);
    if (!el) return;
    var w = $('.hotspots', el);
    if (!w || !$$('.hs', el).length) return;
    w.classList.add('is-live');
    updateFind(n);
    var chip = findChip(n);
    if (chip) requestAnimationFrame(function () { chip.classList.add('on'); });
  }

  function closeMem() { memCard.hidden = true; }
  $('#memClose').addEventListener('click', closeMem);
  $('#memBackdrop').addEventListener('click', closeMem);
  memCard.hidden = true;

  /* ═════════ APERTURA DEL LIBRO ═════════ */

  var bookBtn = $('#book'), flash = $('#openFlash');
  var opened = false;

  function openBook() {
    if (opened) return;
    opened = true;
    playMusic();

    if (reduce) { enterStory(); return; }

    body.classList.add('is-opening');
    setTimeout(function () { body.classList.add('is-diving'); }, 900);
    setTimeout(function () { flash.classList.add('is-on'); }, 1260);
    setTimeout(function () { enterStory(); }, 1950);
    setTimeout(function () { flash.classList.remove('is-on'); }, 2280);
  }

  function enterStory() {
    body.classList.remove('is-book');
    body.classList.add('is-story');
    story.hidden = false;
    progress.hidden = false;
    swap(1);
  }

  bookBtn.addEventListener('click', openBook);

  /* ═════════ VOLVER A LEER ═════════ */

  $('#replayBtn').addEventListener('click', function () {
    if (busy) return;
    seen = {};
    goTo(1);
  });

  markDots();
})();
