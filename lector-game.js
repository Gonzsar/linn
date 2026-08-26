/* ═══════════════════════════════════════════════════════
   CAP 1 · "Parecés una mosca"
   Mini-renderizador isométrico para la escena de Roblox.
   Sin dependencias. Pensado para andar fino en celular.
   ═══════════════════════════════════════════════════════ */

(function (global) {
  'use strict';

  /* ── color ── */
  function shade(hex, k) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.min(255, Math.round(((n >> 16) & 255) * k));
    var g = Math.min(255, Math.round(((n >> 8) & 255) * k));
    var b = Math.min(255, Math.round((n & 255) * k));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  var TOP = 1.0, LEFT = 0.78, RIGHT = 0.56;

  /* ── el juego ── */
  function mount(canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext('2d', { alpha: true });
    var host = opts.host || canvas.parentNode;

    var W = 0, H = 0, DPR = 1, S = 22, ox = 0, oy = 0;
    var ground = null;           // baseplate cacheado
    var raf = 0, last = 0, t = 0;
    var destroyed = false;
    var started = false;
    var armed = false;

    /* ─── mundo ─── */
    var MAX_TRIES = 4;

    var st = {
      phase: 'idle',        // idle · linn · bubble · free · walkout · done
      tries: 0,
      // Viruz
      vx: 0, vy: 0, vz: 0,
      vel: 0, airborne: false, squash: 0, bonk: 0,
      // Aislinn
      lx: 6.4, lz: 3.8, lVisible: false, lStep: 0,
      // jaula
      cageY: 0, cageAlpha: 1, cageFlash: 0,
      walkT: 0,
      parts: [],
      hearts: []
    };

    var CAGE = { half: 2.1, h: 4.1, bar: 0.17 };
    var AV = { legH: 1.10, torH: 1.22, torW: 1.44, torD: 0.70, headS: 0.82 };
    var AV_H = AV.legH + AV.torH + AV.headS;      // ≈ 3.16
    var CEIL = CAGE.h - AV_H;                      // techo alcanzable ≈ 0.94
    var GRAV = 15.5, JUMP = 6.3;

    /* ─── proyección ─── */
    function iso(x, y, z) {
      return { x: ox + (x - z) * S * 0.866, y: oy + (x + z) * S * 0.5 - y * S };
    }

    function resize() {
      var r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      DPR = Math.min(global.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      // Encuadre: la escena se centra en la banda libre entre el HUD de arriba
      // y el narrador / botón de saltar de abajo. Alto de escena ≈ 11.3·S,
      // ancho ≈ 13.9·S (con el baseplate de 8x8).
      var topPad = 70, botPad = H > 560 ? 200 : 120;
      var avail = Math.max(160, H - topPad - botPad);
      S = Math.max(9, Math.min(50, Math.min(W / 14.6, avail / 11.3)));
      ox = W / 2;
      oy = topPad + avail / 2 + S * 0.55;
      ground = null;
    }

    /* ─── primitivas ─── */
    function quad(a, b, c, d, fill) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    }

    // Devuelve las esquinas de la cara "z+d" (la que mira abajo-izquierda)
    function faceQuad(x, y, z, w, h, d) {
      return {
        A: iso(x, y + h, z + d), B: iso(x + w, y + h, z + d),
        C: iso(x + w, y, z + d), D: iso(x, y, z + d)
      };
    }

    function box(g, x, y, z, w, h, d, color, alpha) {
      var c = ctx;
      if (alpha !== undefined && alpha < 1) { c.save(); c.globalAlpha = alpha; }

      var t1 = iso(x, y + h, z), t2 = iso(x + w, y + h, z),
          t3 = iso(x + w, y + h, z + d), t4 = iso(x, y + h, z + d);
      var b3 = iso(x + w, y, z + d), b4 = iso(x, y, z + d), b2 = iso(x + w, y, z);

      quad(t4, t3, b3, b4, shade(color, LEFT));    // cara z+d
      quad(t2, t3, b3, b2, shade(color, RIGHT));   // cara x+w
      quad(t1, t2, t3, t4, shade(color, TOP));     // techo

      if (alpha !== undefined && alpha < 1) c.restore();
    }

    function studs(x, y, z, w, d, color, alpha) {
      var c = ctx;
      if (alpha !== undefined && alpha < 1) { c.save(); c.globalAlpha = alpha; }
      var rx = S * 0.30, ry = S * 0.17, lift = S * 0.13;
      for (var i = 0; i < Math.round(w); i++) {
        for (var j = 0; j < Math.round(d); j++) {
          var p = iso(x + i + 0.5, y, z + j + 0.5);
          c.beginPath(); c.ellipse(p.x, p.y, rx, ry, 0, 0, 6.2832);
          c.fillStyle = shade(color, 0.80); c.fill();
          c.beginPath(); c.ellipse(p.x, p.y - lift, rx, ry, 0, 0, 6.2832);
          c.fillStyle = shade(color, 1.06); c.fill();
        }
      }
      if (alpha !== undefined && alpha < 1) c.restore();
    }

    function blob(x, y, z, rx, ry, alpha) {
      var p = iso(x, y, z);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, rx * S, ry * S, 0, 0, 6.2832);
      ctx.fillStyle = 'rgba(20,40,20,1)';
      ctx.fill();
      ctx.restore();
    }

    /* ─── el terreno (cacheado en un canvas aparte) ─── */
    // Pasto liso con relieve chico, tierra en los costados. Se dibuja una
    // sola vez por tamaño de pantalla y después se copia cada frame.
    function rand(seed) {
      var v = seed;
      return function () {
        v = (v * 1664525 + 1013904223) % 4294967296;
        return v / 4294967296;
      };
    }

    function buildGround() {
      var g = document.createElement('canvas');
      g.width = canvas.width; g.height = canvas.height;
      var gc = g.getContext('2d');
      gc.setTransform(DPR, 0, 0, DPR, 0, 0);

      var R = 4, D = 1.15;
      var GRASS = '#5fae4a', GRASS_D = '#4c9440', DIRT = '#8a6242';

      // esquinas
      var tA = iso(-R, 0, -R), tB = iso(R, 0, -R), tC = iso(R, 0, R), tD = iso(-R, 0, R);
      var bC = iso(R, -D, R), bD = iso(-R, -D, R), bB = iso(R, -D, -R);

      function poly(pts, fill) {
        gc.beginPath();
        gc.moveTo(pts[0].x, pts[0].y);
        for (var i = 1; i < pts.length; i++) gc.lineTo(pts[i].x, pts[i].y);
        gc.closePath();
        gc.fillStyle = fill;
        gc.fill();
      }

      // costados de tierra
      poly([tD, tC, bC, bD], shade(DIRT, 0.86));
      poly([tB, tC, bC, bB], shade(DIRT, 0.64));

      // vetas de tierra
      gc.save();
      gc.beginPath();
      gc.moveTo(tD.x, tD.y); gc.lineTo(tC.x, tC.y); gc.lineTo(bC.x, bC.y); gc.lineTo(bD.x, bD.y);
      gc.closePath();
      gc.lineTo(tB.x, tB.y);
      gc.clip();
      var rv = rand(7);
      for (var v = 0; v < 26; v++) {
        var vx = tD.x + rv() * (bC.x - bD.x);
        var vy = tD.y + rv() * (bD.y - tD.y) + rv() * S * 0.5;
        gc.beginPath();
        gc.ellipse(vx, vy, S * (0.08 + rv() * 0.12), S * 0.05, 0, 0, 6.2832);
        gc.fillStyle = rv() > 0.5 ? 'rgba(60,38,24,.20)' : 'rgba(190,150,110,.14)';
        gc.fill();
      }
      gc.restore();

      // labio de pasto que sobresale del borde
      var lip = S * 0.20;
      poly([tD, tC, { x: tC.x, y: tC.y + lip }, { x: tD.x, y: tD.y + lip }], shade(GRASS, 0.80));
      poly([tB, tC, { x: tC.x, y: tC.y + lip }, { x: tB.x, y: tB.y + lip }], shade(GRASS, 0.66));

      // cara de pasto
      poly([tA, tB, tC, tD], GRASS);

      // todo lo que sigue queda recortado a la cara de arriba
      gc.save();
      gc.beginPath();
      gc.moveTo(tA.x, tA.y); gc.lineTo(tB.x, tB.y); gc.lineTo(tC.x, tC.y); gc.lineTo(tD.x, tD.y);
      gc.closePath();
      gc.clip();

      // manchones suaves de color, para que no sea un verde plano
      var rp = rand(19);
      for (var m = 0; m < 30; m++) {
        var mx = -R + rp() * R * 2, mz = -R + rp() * R * 2;
        var pm = iso(mx, 0, mz);
        gc.beginPath();
        gc.ellipse(pm.x, pm.y, S * (0.5 + rp() * 1.3), S * (0.28 + rp() * 0.55), 0, 0, 6.2832);
        gc.fillStyle = rp() > 0.5 ? 'rgba(120,180,90,.16)' : 'rgba(56,120,52,.14)';
        gc.fill();
      }

      // tierra pisoteada adentro de la jaula
      var pc = iso(0, 0, 0);
      gc.beginPath();
      gc.ellipse(pc.x, pc.y, CAGE.half * 1.5 * S * 0.866, CAGE.half * 1.5 * S * 0.5, 0, 0, 6.2832);
      gc.fillStyle = 'rgba(140,110,70,.16)';
      gc.fill();

      // pastitos
      var rg = rand(101);
      var blades = 175;
      gc.lineCap = 'round';
      for (var b = 0; b < blades; b++) {
        var gx = -R + rg() * R * 2, gz = -R + rg() * R * 2;
        var pg = iso(gx, 0, gz);
        var n = 1 + (rg() > 0.6 ? 1 : 0);
        var dark = rg() > 0.55;
        gc.strokeStyle = dark ? 'rgba(62,126,52,.55)' : 'rgba(146,206,110,.60)';
        gc.lineWidth = Math.max(0.8, S * 0.036);
        for (var k2 = 0; k2 < n; k2++) {
          var offx = (rg() - 0.5) * S * 0.30;
          var h2 = S * (0.08 + rg() * 0.11);
          var lean = (rg() - 0.5) * S * 0.18;
          gc.beginPath();
          gc.moveTo(pg.x + offx, pg.y);
          gc.quadraticCurveTo(pg.x + offx + lean * 0.4, pg.y - h2 * 0.65, pg.x + offx + lean, pg.y - h2);
          gc.stroke();
        }
      }

      // florcitas
      var rf = rand(53);
      for (var f = 0; f < 12; f++) {
        var fx = -R + rf() * R * 2, fz = -R + rf() * R * 2;
        if (Math.abs(fx) < CAGE.half + 0.3 && Math.abs(fz) < CAGE.half + 0.3) continue;
        var pf = iso(fx, 0, fz);
        gc.beginPath();
        gc.arc(pf.x, pf.y - S * 0.10, Math.max(1, S * 0.05), 0, 6.2832);
        gc.fillStyle = rf() > 0.45 ? '#fdf6d8' : '#ffd76b';
        gc.fill();
      }

      gc.restore();

      // rocas
      var real = ctx; ctx = gc;
      var rocks = [[-3.5,-3.1,.8],[3.0,-2.8,.7],[-3.0,3.1,.75],[2.4,3.2,.6],[3.2,0.9,.5],[-3.6,.2,.55]];
      for (var k = 0; k < rocks.length; k++) {
        var r0 = rocks[k];
        box(null, r0[0], 0, r0[1], r0[2], r0[2] * 0.7, r0[2], '#8d9aa2');
      }
      ctx = real;

      ground = g;
    }

    /* ─── avatar ─── */
    // Cada pieza entra por separado en la lista ordenada por profundidad,
    // así los brazos, la cabeza y los barrotes se intercalan bien.
    function avatar(list, px, py, pz, skin, opt) {
      opt = opt || {};
      var sq = opt.squash || 0;
      var step = opt.step || 0;
      var sc = 1 - sq * 0.16;
      var wid = 1 + sq * 0.12;

      var legH  = AV.legH * sc,
          torH  = AV.torH * sc,
          headS = AV.headS * sc,
          torW  = AV.torW * wid,
          torD  = AV.torD;

      var swing = Math.sin(step) * 0.26;
      var bx = px - torW / 2, bz = pz - torD / 2;

      // clave de pintor: profundidad iso + algo de altura
      function push(x, y, z, w, h, d, color) {
        var k = (x + w / 2) + (z + d / 2) + (y + h / 2) * 0.5;
        list.push({ k: k, f: function () { box(null, x, y, z, w, h, d, color); } });
      }

      // sombra en el piso
      list.push({ k: px + pz - 9, f: function () {
        blob(px, 0.02, pz, 0.62, 0.34, 0.20 + Math.max(0, 0.16 - py * 0.12));
      }});

      // piernas
      var legW = torW / 2 - 0.06;
      push(bx + 0.03,               py + swing * 0.10, bz + 0.02, legW, legH, torD - 0.04, skin.pants);
      push(bx + torW / 2 + 0.03,    py - swing * 0.10, bz + 0.02, legW, legH, torD - 0.04, skin.pants2);

      // torso
      push(bx, py + legH, bz, torW, torH, torD, skin.shirt);

      // brazos
      var aw = 0.38, ah = torH * 0.92;
      var armY = py + legH + torH - ah;
      push(bx - aw - 0.03,  armY - swing * 0.16, bz + 0.05, aw, ah, torD - 0.10, skin.skin);
      push(bx + torW + 0.03, armY + swing * 0.16, bz + 0.05, aw, ah, torD - 0.10, skin.skin);

      // cabeza + carita
      var hx = px - headS / 2, hy = py + legH + torH, hz = pz - headS / 2;
      var headK = px + pz + (hy + headS / 2) * 0.5;
      list.push({ k: headK, f: function () {
        box(null, hx, hy, hz, headS, headS, headS, skin.skin);

        if (skin.hair) {
          // casquete
          box(null, hx - 0.05, hy + headS - 0.04, hz - 0.05, headS + 0.10, 0.26, headS + 0.10, skin.hair);
          // nuca: del lado opuesto a la cara, si no le tapa los ojos
          box(null, hx - 0.06, hy + headS - 0.72, hz - 0.13, headS + 0.12, 0.72, 0.13, skin.hair);
          // mechones laterales
          box(null, hx + headS + 0.01, hy + headS - 0.60, hz + 0.05, 0.10, 0.60, headS - 0.05, skin.hair);
        }

        var q = faceQuad(hx, hy, hz, headS, headS, headS);
        var ex = { x: q.B.x - q.A.x, y: q.B.y - q.A.y };
        var ey = { x: q.D.x - q.A.x, y: q.D.y - q.A.y };
        ctx.save();
        ctx.transform(ex.x, ex.y, ey.x, ey.y, q.A.x, q.A.y);
        ctx.fillStyle = '#241a12';
        ctx.beginPath(); ctx.ellipse(0.31, 0.40, 0.070, 0.105, 0, 0, 6.2832); ctx.fill();
        ctx.beginPath(); ctx.ellipse(0.69, 0.40, 0.070, 0.105, 0, 0, 6.2832); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0.34, 0.62); ctx.quadraticCurveTo(0.50, 0.80, 0.66, 0.62);
        ctx.quadraticCurveTo(0.50, 0.71, 0.34, 0.62);
        ctx.fill();
        if (skin.blush) {
          ctx.fillStyle = 'rgba(240,120,150,.45)';
          ctx.beginPath(); ctx.ellipse(0.17, 0.56, 0.075, 0.05, 0, 0, 6.2832); ctx.fill();
          ctx.beginPath(); ctx.ellipse(0.83, 0.56, 0.075, 0.05, 0, 0, 6.2832); ctx.fill();
        }
        ctx.restore();
      }});

      // nametag: siempre al frente de todo
      list.push({ k: 9999, f: function () {
        var np = iso(px, py + legH + torH + headS + 0.90, pz);
        ctx.save();
        ctx.font = '700 ' + Math.max(9, S * 0.38).toFixed(0) + 'px Quicksand, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        var tw = ctx.measureText(skin.name).width + S * 0.5;
        var th = S * 0.60;
        ctx.fillStyle = 'rgba(12,22,40,.62)';
        rr(ctx, np.x - tw / 2, np.y - th / 2, tw, th, th / 2);
        ctx.fill();
        ctx.fillStyle = skin.tag || '#ffffff';
        ctx.fillText(skin.name, np.x, np.y + 0.5);
        ctx.restore();
      }});
    }

    function rr(c, x, y, w, h, r) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    }

    var SKIN_GON = { skin: '#f2c94c', shirt: '#2f7d46', pants: '#2b3a55', pants2: '#26344c', name: 'Viruz', tag: '#c8f0d2' };
    var SKIN_LIN = { skin: '#f2c94c', shirt: '#c86fae', pants: '#3a2b52', pants2: '#332648', hair: '#3a2233', blush: true, name: 'Aislinn', tag: '#ffd0ea' };

    /* ─── jaula ─── */
    function cage(list) {
      if (st.cageAlpha <= 0.01) return;
      var h = CAGE.half, b = CAGE.bar, HH = CAGE.h;
      var y0 = st.cageY;
      var a = st.cageAlpha;
      var flash = st.cageFlash;
      var base = '#9aa7b0';
      var col = flash > 0 ? shade(base, 1 + flash * 0.55) : base;

      function bar(x, z) {
        list.push({ k: x + z + b + (y0 + HH / 2) * 0.5, f: function () {
          box(null, x, y0, z, b, HH, b, col, a);
        }});
      }
      var n = 5;
      for (var i = 0; i <= n; i++) {
        var p = -h + (2 * h) * (i / n);
        bar(p - b / 2, -h - b / 2);
        bar(p - b / 2,  h - b / 2);
        bar(-h - b / 2, p - b / 2);
        bar( h - b / 2, p - b / 2);
      }
      // marco superior
      list.push({ k: -h * 2 + (y0 + HH) * 0.5, f: function () {
        box(null, -h - b / 2, y0 + HH, -h - b / 2, 2 * h + b, b, b, col, a);
        box(null, -h - b / 2, y0 + HH, -h - b / 2, b, b, 2 * h + b, col, a);
      }});
      list.push({ k: h * 2 + (y0 + HH) * 0.5, f: function () {
        box(null, -h - b / 2, y0 + HH,  h - b / 2, 2 * h + b, b, b, col, a);
        box(null,  h - b / 2, y0 + HH, -h - b / 2, b, b, 2 * h + b, col, a);
      }});
    }

    /* ─── partículas ─── */
    function pop(x, y, z, color, n) {
      for (var i = 0; i < n; i++) {
        st.parts.push({
          x: x, y: y, z: z,
          dx: (Math.random() - 0.5) * 3.2,
          dy: 1.4 + Math.random() * 3.4,
          dz: (Math.random() - 0.5) * 3.2,
          life: 0.7 + Math.random() * 0.5, age: 0,
          s: 0.09 + Math.random() * 0.10,
          c: color
        });
      }
    }

    function heart(x, z) {
      st.hearts.push({ x: x, z: z, y: 3.4, age: 0, life: 1.9, dx: (Math.random() - .5) * .6 });
    }

    /* ─── lógica ─── */
    function jump() {
      if (destroyed || !armed || st.phase !== 'idle' || st.airborne) return;
      st.airborne = true;
      st.vel = JUMP;
      if (opts.onJump) opts.onJump();
    }

    function step(dt) {
      t += dt;
      if (st.cageFlash > 0) st.cageFlash = Math.max(0, st.cageFlash - dt * 3.4);
      if (st.squash > 0) st.squash = Math.max(0, st.squash - dt * 5);

      // salto
      if (st.airborne) {
        st.vel -= GRAV * dt;
        st.vy += st.vel * dt;

        if (st.vy >= CEIL && st.vel > 0) {           // ¡clunk!
          st.vy = CEIL;
          st.vel = -st.vel * 0.42;
          st.cageFlash = 1;
          st.squash = 0.6;
          pop(st.vx, CEIL + AV_H - 0.2, st.vz, '#dfe8ee', 9);
          st.tries++;
          if (opts.onBonk) opts.onBonk(st.tries, MAX_TRIES);
          if (st.tries >= MAX_TRIES && st.phase === 'idle') {
            st.phase = 'linn';
            st.lVisible = true;
          }
        }
        if (st.vy <= 0) {
          st.vy = 0; st.vel = 0; st.airborne = false; st.squash = 1;
          pop(st.vx, 0.1, st.vz, '#8ccf7a', 5);
        }
      }

      // Aislinn se acerca
      if (st.phase === 'linn') {
        var tx = 3.05, tz = 0.05;
        var dx = tx - st.lx, dz = tz - st.lz;
        var d = Math.hypot(dx, dz);
        if (d > 0.06) {
          var sp = Math.min(d, 3.1 * dt);
          st.lx += dx / d * sp; st.lz += dz / d * sp;
          st.lStep += dt * 11;
        } else {
          st.lStep = 0;
          st.phase = 'bubble';
          if (opts.onLinn) opts.onLinn(bubbleAnchor());
          setTimeout(function () {
            if (destroyed) return;
            st.phase = 'free';
          }, 2500);
        }
      }

      // la jaula se va
      if (st.phase === 'free') {
        st.cageY += dt * 7.5;
        st.cageAlpha = Math.max(0, 1 - st.cageY / 5.5);
        if (st.cageAlpha <= 0.02) {
          st.phase = 'walkout';
          if (opts.onFree) opts.onFree();
        }
      }

      // Viruz sale
      if (st.phase === 'walkout') {
        var gx = 1.65, gz = -0.05;
        var ddx = gx - st.vx, ddz = gz - st.vz;
        var dd = Math.hypot(ddx, ddz);
        if (dd > 0.06) {
          var s2 = Math.min(dd, 2.6 * dt);
          st.vx += ddx / dd * s2; st.vz += ddz / dd * s2;
          st.walkT += dt * 10;
        } else {
          st.walkT = 0;
          st.phase = 'done';
          for (var i = 0; i < 4; i++) heart(2.35 + (Math.random() - .5), 0.0);
          setTimeout(function () { if (!destroyed && opts.onDone) opts.onDone(); }, 1250);
        }
      }

      // partículas
      for (var p = st.parts.length - 1; p >= 0; p--) {
        var q = st.parts[p];
        q.age += dt;
        if (q.age >= q.life) { st.parts.splice(p, 1); continue; }
        q.dy -= 13 * dt;
        q.x += q.dx * dt; q.y += q.dy * dt; q.z += q.dz * dt;
        if (q.y < 0.05) { q.y = 0.05; q.dy *= -0.35; q.dx *= .7; q.dz *= .7; }
      }
      for (var hI = st.hearts.length - 1; hI >= 0; hI--) {
        var hh = st.hearts[hI];
        hh.age += dt;
        if (hh.age >= hh.life) { st.hearts.splice(hI, 1); continue; }
        hh.y += dt * 1.05; hh.x += hh.dx * dt;
      }
    }

    function bubbleAnchor() {
      var p = iso(st.lx, 5.0, st.lz);
      return { x: p.x, y: p.y, w: W, h: H };
    }

    /* ─── render ─── */
    function draw() {
      ctx.clearRect(0, 0, W, H);
      if (!ground) buildGround();
      if (ground) ctx.drawImage(ground, 0, 0, W, H);

      var list = [];
      cage(list);

      var bob = st.airborne ? 0 : Math.sin(t * 2.1) * 0.026;
      avatar(list, st.vx, st.vy + bob, st.vz, SKIN_GON, {
        squash: st.squash, step: st.walkT
      });
      if (st.lVisible) {
        avatar(list, st.lx, Math.sin(t * 1.9 + 1) * 0.026, st.lz, SKIN_LIN, { step: st.lStep });
      }

      list.sort(function (a, b) { return a.k - b.k; });
      for (var i = 0; i < list.length; i++) list[i].f();

      // partículas por encima
      for (var p = 0; p < st.parts.length; p++) {
        var q = st.parts[p];
        var a = 1 - q.age / q.life;
        ctx.save(); ctx.globalAlpha = Math.max(0, a);
        box(null, q.x, q.y, q.z, q.s, q.s, q.s, q.c);
        ctx.restore();
      }
      for (var hI = 0; hI < st.hearts.length; hI++) {
        var hh = st.hearts[hI];
        var hp = iso(hh.x, hh.y, hh.z);
        var ha = 1 - hh.age / hh.life;
        ctx.save();
        ctx.globalAlpha = Math.max(0, ha) * 0.95;
        ctx.font = (S * 0.85).toFixed(0) + 'px serif';
        ctx.textAlign = 'center';
        ctx.fillText('💛', hp.x, hp.y);
        ctx.restore();
      }
    }

    function loop(now) {
      if (destroyed) return;
      if (!last) last = now;
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      step(dt);
      draw();
      raf = requestAnimationFrame(loop);
    }

    /* ─── entrada ─── */
    function onPointer(e) {
      if (!armed || st.phase !== 'idle') return;
      e.preventDefault();
      jump();
    }

    var ro = null;
    function bind() {
      canvas.addEventListener('pointerdown', onPointer, { passive: false });
      if (global.ResizeObserver) {
        ro = new ResizeObserver(function () { resize(); });
        ro.observe(canvas);
      } else {
        global.addEventListener('resize', resize);
      }
    }

    resize();
    bind();
    draw();

    return {
      start: function () {
        if (started) return;
        started = true;
        last = 0;
        raf = requestAnimationFrame(loop);
      },
      arm: function () { armed = true; },
      anchor: bubbleAnchor,
      reset: function () {
        st.phase = 'idle'; st.tries = 0;
        st.vx = 0; st.vy = 0; st.vz = 0; st.vel = 0; st.airborne = false;
        st.lx = 6.4; st.lz = 3.8; st.lVisible = false; st.lStep = 0;
        st.cageY = 0; st.cageAlpha = 1; st.cageFlash = 0; st.walkT = 0;
        st.parts.length = 0; st.hearts.length = 0;
        armed = false;
      },
      destroy: function () {
        destroyed = true;
        cancelAnimationFrame(raf);
        canvas.removeEventListener('pointerdown', onPointer);
        if (ro) ro.disconnect(); else global.removeEventListener('resize', resize);
      }
    };
  }

  global.CageGame = { mount: mount };

})(window);
