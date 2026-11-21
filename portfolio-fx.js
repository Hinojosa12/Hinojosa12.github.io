/* Efectos del portafolio:
   1) Interruptor día/noche (tema claro/oscuro)
   2) Texto que se descifra (eyebrow de la portada y etiquetas de sección)
   3) Botones magnéticos en la portada (te siguen aunque el ratón esté lejos)
   4) Texto de partículas en Contacto ("LET'S TALK" / "HABLEMOS") */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lang = function () { return root.getAttribute('data-lang') === 'es' ? 'es' : 'en'; };

  var css = `
.dn{all:unset;cursor:pointer;flex:none;width:56px;height:28px;border-radius:999px;position:relative;overflow:hidden;
    background:linear-gradient(#5fb8ff,#9fd8ff);transition:background .6s;box-shadow:inset 0 2px 5px rgba(0,0,0,.25)}
.dn:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.dn.night{background:linear-gradient(#0b1430,#1c2a5a)}
.dn .orb{position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#ffd23f;box-shadow:0 0 10px #ffd23f;
         transition:transform .6s cubic-bezier(.6,-0.2,.3,1.3),background .6s,box-shadow .6s;overflow:hidden}
.dn.night .orb{transform:translateX(28px);background:#e8ecf5;box-shadow:0 0 8px rgba(232,236,245,.6)}
.dn .orb::after{content:"";position:absolute;width:22px;height:22px;border-radius:50%;background:#1c2a5a;top:-5px;left:-22px;transition:left .6s}
.dn.night .orb::after{left:-10px}
.dn .cloud{position:absolute;background:#fff;border-radius:999px;transition:transform .6s,opacity .6s}
.dn .c1{width:18px;height:6px;right:7px;top:8px}
.dn .c2{width:12px;height:4px;right:16px;top:17px;opacity:.8}
.dn.night .cloud{transform:translateY(24px);opacity:0}
.dn .st{position:absolute;width:2px;height:2px;border-radius:50%;background:#fff;opacity:0;transform:translateY(-12px);transition:.6s}
.dn.night .st{opacity:1;transform:none}
.pfx-band{position:relative;z-index:1;max-width:1120px;margin:0 auto;padding:clamp(36px,6vw,64px) clamp(16px,4vw,40px) 0}
.pfx-band canvas{display:block;width:100%;height:clamp(120px,18vw,200px);cursor:crosshair;touch-action:pan-y}
#contact .wrap{padding-top:clamp(24px,4vw,40px)}
@media (prefers-reduced-motion:reduce){.dn,.dn *{transition:none!important}}
`;
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- 1. día / noche ---------- */
  (function () {
    var langBox = document.querySelector('.top .lang');
    if (!langBox) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dn';
    btn.innerHTML = '<span class="orb"></span><span class="cloud c1"></span><span class="cloud c2"></span>' +
      '<span class="st" style="left:8px;top:6px"></span><span class="st" style="left:16px;top:18px"></span><span class="st" style="left:24px;top:9px"></span>';
    langBox.parentNode.insertBefore(btn, langBox);

    var saved = null; try { saved = localStorage.getItem('ah-theme'); } catch (e) {}
    var sysDark = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
    function apply(theme, save) {
      root.setAttribute('data-theme', theme);
      btn.classList.toggle('night', theme === 'dark');
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      if (save) try { localStorage.setItem('ah-theme', theme); } catch (e) {}
    }
    apply(saved === 'light' || saved === 'dark' ? saved : (sysDark ? 'dark' : 'light'), false);
    btn.addEventListener('click', function () { apply(btn.classList.contains('night') ? 'light' : 'dark', true); });
  })();

  /* ---------- 2. texto que se descifra ---------- */
  (function () {
    var chars = '!<>-_\\/[]{}=+*^?#01';
    function textNodes(el) {
      var out = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) if (w.currentNode.nodeValue.trim()) out.push(w.currentNode);
      return out;
    }
    function scramble(el) {
      if (reduce || el._busy) return;
      el._busy = true;
      var nodes = textNodes(el).map(function (n) {
        var fin = n._final || (n._final = n.nodeValue);
        return { n: n, q: fin.split('').map(function (c) {
          var s = Math.floor(Math.random() * 14);
          return { c: c, start: s, end: s + 6 + Math.floor(Math.random() * 18) };
        }) };
      });
      var f = 0;
      (function step() {
        var pending = false;
        nodes.forEach(function (o) {
          o.n.nodeValue = o.q.map(function (x) {
            if (x.c === ' ' || f >= x.end) return x.c;
            pending = true;
            return f >= x.start ? chars[Math.floor(Math.random() * chars.length)] : x.c;
          }).join('');
        });
        f++;
        if (pending) requestAnimationFrame(step); else el._busy = false;
      })();
    }
    var eyebrow = document.querySelector('.hero .eyebrow');
    if (eyebrow) { setTimeout(function () { scramble(eyebrow); }, 300); eyebrow.addEventListener('mouseenter', function () { scramble(eyebrow); }); }

    var labels = document.querySelectorAll('.sec-label');
    labels.forEach(function (l) { l.addEventListener('mouseenter', function () { scramble(l); }); });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { scramble(e.target); io.unobserve(e.target); } });
      }, { threshold: 1 });
      labels.forEach(function (l) { io.observe(l); });
    }
    /* al cambiar de idioma, descifrar de nuevo lo visible */
    new MutationObserver(function () {
      if (eyebrow) scramble(eyebrow);
    }).observe(root, { attributes: true, attributeFilter: ['data-lang'] });
  })();

  /* ---------- 3. botones magnéticos ---------- */
  (function () {
    if (reduce || !(window.matchMedia && matchMedia('(hover: hover)').matches)) return;
    var btns = Array.prototype.slice.call(document.querySelectorAll('.hero .cta .btn'));
    if (!btns.length) return;
    btns.forEach(function (b) { b.style.transition = 'transform .4s cubic-bezier(.2,.8,.3,1.2)'; b.style.willChange = 'transform'; });
    var mx = null, my = null, raf = 0;
    function update() {
      raf = 0;
      if (mx === null) return;
      btns.forEach(function (b) {
        var r = b.getBoundingClientRect();
        var dx = mx - (r.left + r.width / 2), dy = my - (r.top + r.height / 2);
        var d = Math.hypot(dx, dy) || 1;
        /* lejos: siempre se inclina hacia el ratón (hasta 16px); cerca: lo sigue con más fuerza */
        var far = 16 * (1 - Math.exp(-d / 260));
        var near = d < 160 ? (160 - d) * 0.14 : 0;
        var m = Math.min(far + near, d * 0.45);
        var rot = (dx / d) * 4;
        b.style.transform = 'translate(' + (dx / d * m).toFixed(1) + 'px,' + (dy / d * m).toFixed(1) + 'px) rotate(' + rot.toFixed(2) + 'deg)';
      });
    }
    function queue() { if (!raf) raf = requestAnimationFrame(update); }
    addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; queue(); });
    addEventListener('scroll', queue, { passive: true });
    document.addEventListener('mouseleave', function () { mx = null; btns.forEach(function (b) { b.style.transform = ''; }); });
  })();

  /* ---------- 4. texto de partículas en Contacto ---------- */
  (function () {
    var contact = document.getElementById('contact');
    if (!contact) return;
    var band = document.createElement('div');
    band.className = 'pfx-band';
    band.innerHTML = '<canvas aria-hidden="true"></canvas>';
    contact.insertBefore(band, contact.querySelector('.wrap'));
    var cv = band.querySelector('canvas'), ctx = cv.getContext('2d');
    var pts = [], mouse = { x: -999, y: -999 }, W = 0, H = 0, running = false, visible = false;
    var TEXT = { en: "LET'S TALK", es: 'HABLEMOS' };

    function build() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      if (!W || !H) return;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var off = document.createElement('canvas'), o = off.getContext('2d');
      off.width = W; off.height = H;
      var txt = TEXT[lang()], size = H * 0.78;
      o.font = '800 ' + size + 'px Unbounded, "Arial Black", sans-serif';
      while (o.measureText(txt).width > W * 0.98 && size > 10) { size -= 2; o.font = '800 ' + size + 'px Unbounded, "Arial Black", sans-serif'; }
      o.fillStyle = '#fff'; o.textAlign = 'left'; o.textBaseline = 'middle';
      o.fillText(txt, 0, H / 2);
      var data = o.getImageData(0, 0, W, H).data, gap = W < 500 ? 3 : 4, old = pts;
      pts = [];
      for (var y = 0; y < H; y += gap) for (var x = 0; x < W; x += gap)
        if (data[(y * W + x) * 4 + 3] > 128) {
          var prev = old[pts.length];
          pts.push({ x: prev ? prev.x : Math.random() * W, y: prev ? prev.y : Math.random() * H, hx: x, hy: y, vx: 0, vy: 0,
                     c: 'hsl(' + (212 + (x / W) * 30) + ',100%,' + (62 + (x / W) * 14) + '%)' });
        }
      if (reduce) pts.forEach(function (p) { p.x = p.hx; p.y = p.hy; });
      draw();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) { var p = pts[i]; ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, 2.4, 2.4); }
    }
    function loop() {
      if (!visible || reduce) { running = false; return; }
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i], dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 4900) { var f = (4900 - d2) / 4900 * 6, d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f; }
        p.vx += (p.hx - p.x) * .06; p.vy += (p.hy - p.y) * .06;
        p.vx *= .82; p.vy *= .82; p.x += p.vx; p.y += p.vy;
      }
      draw();
      requestAnimationFrame(loop);
    }
    function start() { if (!running) { running = true; requestAnimationFrame(loop); } }
    function pos(e) { var r = cv.getBoundingClientRect(), t = e.touches ? e.touches[0] : e; mouse.x = t.clientX - r.left; mouse.y = t.clientY - r.top; }
    cv.addEventListener('mousemove', pos);
    cv.addEventListener('touchmove', pos, { passive: true });
    cv.addEventListener('mouseleave', function () { mouse.x = mouse.y = -999; });
    cv.addEventListener('touchend', function () { mouse.x = mouse.y = -999; });

    var lastW = 0;
    addEventListener('resize', function () { if (cv.clientWidth !== lastW) { lastW = cv.clientWidth; build(); } });
    new MutationObserver(function () { pts.forEach(function (p) { p.x += (Math.random() - .5) * 200; p.y += (Math.random() - .5) * 120; }); build(); start(); })
      .observe(root, { attributes: true, attributeFilter: ['data-lang'] });

    if ('IntersectionObserver' in window)
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) start(); }).observe(cv);
    else visible = true;

    var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(function () { lastW = cv.clientWidth; build(); start(); });
  })();
})();