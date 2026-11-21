/* Skills Walk — personaje controlable que recorre las habilidades del portafolio.
   Lee las habilidades directamente de #skills .sk, así que si cambias la lista,
   el juego se actualiza solo. */
(function () {
  var section = document.getElementById('skills');
  if (!section) return;
  var groups = section.querySelectorAll('.sk');
  if (!groups.length) return;
  var grid = section.querySelector('.skills');

  /* ---------- estilos ---------- */
  var css = `
.sw{position:relative;margin:8px 0 40px;border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--surface);outline:none;user-select:none;-webkit-user-select:none}
.sw:focus-visible{box-shadow:0 0 0 3px var(--accent)}
.sw-hud{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 16px;font-family:var(--mono);font-size:12px;color:var(--muted);border-bottom:1px solid var(--line);background:var(--bg)}
.sw-hud kbd{font-family:var(--mono);font-size:11px;border:1px solid var(--line);border-radius:4px;padding:1px 6px;background:var(--surface);color:var(--ink)}
.sw-count{color:var(--accent);font-variant-numeric:tabular-nums}
.sw-view{position:relative;height:360px;overflow:hidden;cursor:pointer}
.sw-sky,.sw-world{position:absolute;top:0;left:0;height:100%;will-change:transform}
.sw-sky{opacity:.55}
.sw-bld{position:absolute;bottom:62px;background:var(--line);border-radius:4px 4px 0 0}
.sw-bld i{position:absolute;width:6px;height:8px;background:var(--surface);border-radius:1px}
.sw-ground{position:absolute;left:0;right:0;bottom:0;height:62px;background:var(--bg);border-top:2px solid var(--ink)}
.sw-ground::after{content:"";position:absolute;left:0;right:0;top:22px;height:2px;background:repeating-linear-gradient(90deg,var(--line) 0 28px,transparent 28px 56px)}
.sw-post{position:absolute;z-index:1;bottom:62px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;cursor:pointer}
.sw-sign{font-family:var(--mono);font-size:12px;white-space:nowrap;padding:6px 10px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--muted);transition:all .25s}
.sw-pole{width:3px;height:110px;background:var(--line);transition:background .25s}
.sw-post.seen .sw-sign{color:var(--ink);border-color:var(--accent)}
.sw-post.seen .sw-pole{background:var(--accent)}
.sw-post.here .sw-sign{background:var(--accent);color:#fff;border-color:var(--accent);transform:translateY(-4px)}
.sw-hero{position:absolute;bottom:56px;width:76px;height:114px;margin-left:-38px;z-index:2}
.sw-hero svg{width:100%;height:100%;overflow:visible}
.sw-hero.left svg{transform:scaleX(-1)}
.sw-hero .leg-a,.sw-hero .leg-b{transform-origin:28px 56px}
.sw-hero .arm-a,.sw-hero .arm-b{transform-origin:28px 34px}
.sw-hero.walk .leg-a,.sw-hero.walk .arm-b{animation:sw-swing .42s ease-in-out infinite alternate}
.sw-hero.walk .leg-b,.sw-hero.walk .arm-a{animation:sw-swing .42s ease-in-out infinite alternate-reverse}
.sw-hero.walk .body{animation:sw-bob .21s ease-in-out infinite alternate}
@keyframes sw-swing{from{transform:rotate(-24deg)}to{transform:rotate(24deg)}}
@keyframes sw-bob{from{transform:translateY(0)}to{transform:translateY(-2px)}}
.sw-panel{position:absolute;top:14px;left:14px;right:14px;padding:14px 16px;border-radius:12px;background:var(--board);color:var(--board-ink);box-shadow:0 20px 40px -24px rgba(10,30,90,.6);opacity:0;transform:translateY(-8px);transition:opacity .25s,transform .25s;pointer-events:none}
.sw-panel.show{opacity:1;transform:none}
.sw-panel .t{font-family:var(--mono);font-size:12px;color:var(--board-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px}
.sw-panel .t b{color:#fff;font-weight:600}
.sw-panel .chips{display:flex;flex-wrap:wrap;gap:6px;margin:0}
.sw-panel .chip{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.14);color:var(--board-ink)}
.sw-start{position:absolute;top:50%;left:50%;transform:translate(-50%,-90%);font-family:var(--mono);font-size:13px;color:var(--muted);text-align:center;pointer-events:none;transition:opacity .3s}
.sw-pad{display:none;justify-content:space-between;padding:10px 16px;border-top:1px solid var(--line);background:var(--bg)}
.sw-pad button{all:unset;width:64px;height:44px;display:grid;place-items:center;border:1px solid var(--line);border-radius:10px;font-size:20px;color:var(--ink);background:var(--surface);touch-action:none}
.sw-pad button:active{background:var(--accent);color:#fff}
.sw-touch{display:none}
@media (hover:none),(max-width:760px){.sw-pad{display:flex}.sw-keys{display:none}.sw-touch{display:inline}.sw-view{height:380px}}
@media (max-width:520px){.sw-panel{padding:12px}.sw-panel .chip{font-size:11px}}
`;
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- estructura ---------- */
  var GAP = 340, START = 220;
  var W = START + groups.length * GAP + 260;

  var wrap = document.createElement('div');
  wrap.className = 'sw';
  wrap.tabIndex = 0;
  wrap.setAttribute('role', 'application');
  wrap.setAttribute('aria-label', 'Skills walk — use left and right arrow keys');
  wrap.innerHTML =
    '<div class="sw-hud">' +
      '<span class="sw-keys"><kbd>←</kbd> <kbd>→</kbd> <span class="en">or</span><span class="es">o</span> <kbd>A</kbd> <kbd>D</kbd> · <span class="en">walk to discover my skills</span><span class="es">camina para descubrir mis habilidades</span></span>' +
      '<span class="sw-touch"><span class="en">Hold ◀ ▶ or tap to walk</span><span class="es">Mantén ◀ ▶ o toca para caminar</span></span>' +
      '<span class="sw-count">0/' + groups.length + '</span>' +
    '</div>' +
    '<div class="sw-view">' +
      '<div class="sw-sky"></div>' +
      '<div class="sw-world" style="width:' + W + 'px">' +
        '<div class="sw-ground"></div>' +
        '<div class="sw-hero"><svg viewBox="0 0 56 84" aria-hidden="true">' +
          '<g class="body">' +
            '<g class="leg-b"><rect x="24" y="54" width="8" height="24" rx="3" fill="#1b2c55"/><rect x="22" y="76" width="14" height="6" rx="3" fill="var(--ink)"/></g>' +
            '<g class="arm-a"><rect x="24.5" y="33" width="7" height="20" rx="3.5" fill="#c99a72"/></g>' +
            '<rect x="17" y="30" width="22" height="28" rx="7" fill="var(--accent)"/>' +
            '<circle cx="28" cy="17" r="12" fill="#d9a77c"/>' +
            '<path d="M16 15 Q18 3 29 4 Q40 4 41 14 Q36 9 30 10 Q22 9 16 15Z" fill="#1c1410"/>' +
            '<circle cx="34" cy="17" r="1.6" fill="#1c1410"/>' +
            '<path d="M31 22 Q35 24 37 21" stroke="#7a4426" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
            '<g class="leg-a"><rect x="24" y="54" width="8" height="24" rx="3" fill="#24396b"/><rect x="22" y="76" width="14" height="6" rx="3" fill="var(--ink)"/></g>' +
            '<g class="arm-b"><rect x="24.5" y="33" width="7" height="20" rx="3.5" fill="#d9a77c"/><rect x="21" y="46" width="16" height="10" rx="2" fill="var(--board)" stroke="var(--accent)" stroke-width="1"/></g>' +
          '</g>' +
        '</svg></div>' +
      '</div>' +
      '<div class="sw-start"><span class="en">→ start walking</span><span class="es">→ empieza a caminar</span></div>' +
      '<div class="sw-panel"><div class="t"></div><div class="c"></div></div>' +
    '</div>' +
    '<div class="sw-pad"><button type="button" data-dir="-1" aria-label="Left">◀</button><button type="button" data-dir="1" aria-label="Right">▶</button></div>';

  section.querySelector('.wrap').insertBefore(wrap, grid);

  var view = wrap.querySelector('.sw-view');
  var world = wrap.querySelector('.sw-world');
  var sky = wrap.querySelector('.sw-sky');
  var hero = wrap.querySelector('.sw-hero');
  var panel = wrap.querySelector('.sw-panel');
  var panelT = panel.querySelector('.t');
  var panelC = panel.querySelector('.c');
  var counter = wrap.querySelector('.sw-count');
  var startTip = wrap.querySelector('.sw-start');

  /* edificios de fondo (parallax) */
  var skyW = Math.ceil(W * 0.4) + 1400, bx = 0, seed = 7;
  function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  sky.style.width = skyW + 'px';
  while (bx < skyW) {
    var bw = 60 + rnd() * 90, bh = 70 + rnd() * 120;
    var b = document.createElement('div');
    b.className = 'sw-bld';
    b.style.cssText = 'left:' + bx + 'px;width:' + bw + 'px;height:' + bh + 'px';
    for (var wy = 14; wy < bh - 14; wy += 20)
      for (var wx = 10; wx < bw - 14; wx += 16)
        if (rnd() > 0.45) { var i = document.createElement('i'); i.style.left = wx + 'px'; i.style.top = wy + 'px'; b.appendChild(i); }
    sky.appendChild(b);
    bx += bw + 14 + rnd() * 30;
  }

  /* estaciones: una por grupo de habilidades */
  var posts = [];
  groups.forEach(function (g, n) {
    var px = START + n * GAP + GAP / 2;
    var p = document.createElement('div');
    p.className = 'sw-post';
    p.style.left = px + 'px';
    p.innerHTML = '<div class="sw-sign">' + g.querySelector('h3').innerHTML + '</div><div class="sw-pole"></div>';
    p.addEventListener('click', function (e) { e.stopPropagation(); target = px; wrap.focus({ preventScroll: true }); });
    world.appendChild(p);
    posts.push({ x: px, el: p, title: g.querySelector('h3').innerHTML, chips: g.querySelector('.chips').innerHTML, seen: false });
  });

  /* ---------- lógica ---------- */
  var x = 80, target = null, camX = 0, last = 0, current = -1, seenCount = 0;
  var SPEED = 260, NEAR = 90;
  var keys = { l: false, r: false }, pad = 0, inView = false;

  function setPanel(i) {
    if (i === current) return;
    current = i;
    posts.forEach(function (p, k) { p.el.classList.toggle('here', k === i); });
    if (i < 0) { panel.classList.remove('show'); return; }
    var p = posts[i];
    panelT.innerHTML = '<b>' + p.title + '</b> · ' + (i + 1) + '/' + posts.length;
    panelC.innerHTML = '<div class="chips">' + p.chips + '</div>';
    panel.classList.add('show');
    if (!p.seen) { p.seen = true; seenCount++; p.el.classList.add('seen'); counter.textContent = seenCount + '/' + posts.length; }
  }

  function frame(t) {
    var dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
    last = t;
    var d = (keys.r ? 1 : 0) - (keys.l ? 1 : 0) + pad;
    if (d) target = null;
    else if (target !== null) {
      if (Math.abs(target - x) < 4) { x = target; target = null; }
      else d = target > x ? 1 : -1;
    }
    d = Math.max(-1, Math.min(1, d));
    if (d) {
      x = Math.max(40, Math.min(W - 40, x + d * SPEED * dt));
      hero.classList.toggle('left', d < 0);
      startTip.style.opacity = 0;
    }
    hero.classList.toggle('walk', d !== 0);

    var vw = view.clientWidth;
    var want = Math.max(0, Math.min(W - vw, x - vw * 0.4));
    camX += (want - camX) * Math.min(1, dt * 8);
    world.style.transform = 'translateX(' + (-camX) + 'px)';
    sky.style.transform = 'translateX(' + (-camX * 0.4) + 'px)';
    hero.style.left = x + 'px';

    var near = -1;
    posts.forEach(function (p, k) { if (Math.abs(p.x - x) < NEAR) near = k; });
    setPanel(near);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* teclado: solo cuando el juego está visible */
  if ('IntersectionObserver' in window)
    new IntersectionObserver(function (e) { inView = e[0].isIntersecting; }, { threshold: 0.5 }).observe(view);
  else inView = true;

  function isTyping(e) { var n = e.target.tagName; return n === 'INPUT' || n === 'TEXTAREA' || e.target.isContentEditable; }
  document.addEventListener('keydown', function (e) {
    if (!inView || isTyping(e)) return;
    var k = e.key.toLowerCase();
    if (k === 'arrowleft' || k === 'a') { keys.l = true; e.preventDefault(); }
    if (k === 'arrowright' || k === 'd') { keys.r = true; e.preventDefault(); }
  });
  document.addEventListener('keyup', function (e) {
    var k = e.key.toLowerCase();
    if (k === 'arrowleft' || k === 'a') keys.l = false;
    if (k === 'arrowright' || k === 'd') keys.r = false;
  });
  window.addEventListener('blur', function () { keys.l = keys.r = false; pad = 0; });

  /* clic / toque en el escenario: caminar hasta ese punto */
  view.addEventListener('click', function (e) {
    var r = view.getBoundingClientRect();
    target = Math.max(40, Math.min(W - 40, e.clientX - r.left + camX));
    wrap.focus({ preventScroll: true });
  });

  /* botones táctiles (mantener presionado) */
  wrap.querySelectorAll('.sw-pad button').forEach(function (b) {
    var d = +b.dataset.dir;
    function on(e) { e.preventDefault(); pad = d; }
    function off() { if (pad === d) pad = 0; }
    b.addEventListener('pointerdown', on);
    b.addEventListener('pointerup', off);
    b.addEventListener('pointerleave', off);
    b.addEventListener('pointercancel', off);
  });
})();