/* Botón "Download CV" en Contacto: el aro se desenrolla en barra de progreso,
   una cajita baja en paracaídas y al terminar se descarga el PDF. */
(function () {
  var CV_URL = 'CV_Alcide_Hinojosa_EN.pdf';
  var contact = document.querySelector('#contact .wrap > div');
  if (!contact) return;

  var css = `
.cvdl{margin-top:30px}
.cvdl-btn{all:unset;position:relative;display:block;cursor:pointer;width:min(340px,100%);-webkit-tap-highlight-color:transparent;border-radius:12px}
.cvdl-btn:focus-visible{outline:2px solid #4C82FF;outline-offset:6px}
.cvdl-btn svg{width:100%;height:auto;display:block;overflow:visible}
.cvdl-label{position:absolute;left:31%;top:36%;transform:translateY(-50%);font-family:var(--display);font-weight:700;font-size:clamp(17px,2vw,20px);color:#fff;letter-spacing:-.01em;transition:opacity .25s,transform .25s;pointer-events:none;white-space:nowrap}
.cvdl-label small{display:block;font-family:var(--mono);font-weight:400;font-size:12px;color:var(--board-muted);letter-spacing:0;margin-top:2px}
.cvdl-btn.busy .cvdl-label,.cvdl-btn.done .cvdl-label{opacity:0;transform:translate(10px,-50%)}
.cvdl-rail{fill:none;stroke-width:4;stroke-linecap:round}
.cvdl-track{stroke:rgba(76,130,255,.18)}
.cvdl-fill{stroke:#4C82FF;stroke-dasharray:1 1;stroke-dashoffset:0;filter:drop-shadow(0 0 6px rgba(76,130,255,.75))}
.cvdl-arrow{fill:#4C82FF;transition:opacity .25s,transform .35s}
.cvdl-check{fill:none;stroke:#4C82FF;stroke-width:4.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;opacity:0}
.cvdl-btn.busy .cvdl-arrow,.cvdl-btn.done .cvdl-arrow{opacity:0;transform:translateY(10px)}
.cvdl-btn.done .cvdl-check{opacity:1;stroke-dashoffset:0;transition:stroke-dashoffset .45s .15s ease-out,opacity .1s}
.cvdl-btn:hover:not(.busy) .cvdl-track{stroke:rgba(76,130,255,.35)}
.cvdl-rig{opacity:0;transition:opacity .25s}
.cvdl-btn.busy .cvdl-rig{opacity:1}
.cvdl-rig .canopy{fill:#4C82FF}
.cvdl-rig .lines{stroke:#9BBEFF;stroke-width:1;opacity:.7}
.cvdl-rig .box{fill:var(--board);stroke:#4C82FF;stroke-width:2}
.cvdl-status{margin-top:6px;font-family:var(--mono);font-size:12px;color:var(--board-muted);min-height:18px}
.cvdl-status b{color:#4C82FF;font-weight:500}
@media (prefers-reduced-motion:reduce){.cvdl-rig{display:none}}
`;
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var box = document.createElement('div');
  box.className = 'cvdl';
  box.innerHTML =
    '<button class="cvdl-btn" type="button" aria-label="Download CV (PDF)">' +
      '<svg viewBox="0 0 340 120" aria-hidden="true">' +
        '<path class="cvdl-rail cvdl-track" pathLength="1"/>' +
        '<path class="cvdl-rail cvdl-fill" pathLength="1"/>' +
        '<g class="cvdl-rig"><path class="canopy" d="M-13 0 A13 10 0 0 1 13 0 Q6 -2.5 0 0 Q-6 -2.5 -13 0Z"/>' +
          '<path class="lines" d="M-12 0 L-4 14 M12 0 L4 14 M0 0 L0 14"/><rect class="box" x="-6" y="14" width="12" height="10" rx="2"/></g>' +
        '<path class="cvdl-arrow" d="M44 31 h12 v16 h9 l-15 16 l-15 -16 h9 z"/>' +
        '<path class="cvdl-check" pathLength="1" d="M38 44 l9 9 l17 -19"/>' +
      '</svg>' +
      '<span class="cvdl-label"><span class="en">Download CV</span><span class="es">Descargar CV</span><small>PDF · English</small></span>' +
    '</button>' +
    '<div class="cvdl-status"></div>';
  contact.appendChild(box);

  var btn = box.querySelector('.cvdl-btn');
  var paths = box.querySelectorAll('.cvdl-rail');
  var fill = box.querySelector('.cvdl-fill');
  var rig = box.querySelector('.cvdl-rig');
  var status = box.querySelector('.cvdl-status');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var es = function () { return document.documentElement.getAttribute('data-lang') === 'es'; };

  var CX = 50, CY = 45, R = 32, LX = 14, LW = 312, LY = 100, N = 120;

  /* un solo trazo: cada punto mezcla su lugar en el aro con su lugar en la barra */
  function shape(p) {
    var d = '';
    for (var i = 0; i <= N; i++) {
      var t = i / N, a = Math.PI / 2 + Math.PI * 2 * t;
      var cx = CX + R * Math.cos(a), cy = CY + R * Math.sin(a);
      var x = cx + (LX + LW * t - cx) * p, y = cy + (LY - cy) * p;
      d += (i ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2);
    }
    paths.forEach(function (el) { el.setAttribute('d', d); });
  }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function animar(from, to, ms) {
    return new Promise(function (res) {
      if (reduce) { shape(to); return res(); }
      var t0 = performance.now();
      (function step(now) {
        var k = Math.min((now - t0) / ms, 1);
        shape(from + (to - from) * ease(k));
        k < 1 ? requestAnimationFrame(step) : res();
      })(t0);
    });
  }
  function setProgress(v) { fill.style.strokeDashoffset = 1 - v; }

  shape(0); setProgress(1);
  var estado = 'idle';

  btn.addEventListener('click', function () {
    if (estado === 'busy') return;
    if (estado === 'done') { btn.classList.remove('done'); status.innerHTML = ''; estado = 'idle'; return; }
    estado = 'busy';
    btn.classList.add('busy');
    setProgress(0);

    /* descarga real con progreso; si no se puede leer (p. ej. abriendo el archivo local), se simula */
    var loaded = 0, total = 0, finished = false, blob = null;
    fetch(CV_URL).then(function (r) {
      if (!r.ok) throw 0;
      total = +r.headers.get('content-length') || 0;
      if (!r.body || !total) return r.blob().then(function (b) { blob = b; total = b.size; loaded = total; finished = true; });
      var reader = r.body.getReader(), chunks = [];
      return (function leer() {
        return reader.read().then(function (x) {
          if (x.done) { blob = new Blob(chunks, { type: 'application/pdf' }); finished = true; return; }
          chunks.push(x.value); loaded += x.value.length; return leer();
        });
      })();
    }).catch(function () { finished = true; loaded = total = 1; });

    animar(0, 1, 650).then(function () {
      var minMs = reduce ? 300 : 2200, t0 = performance.now();
      return new Promise(function (res) {
        (function tick(now) {
          var actual = total ? loaded / total : 0;
          var shown = Math.min(actual, (now - t0) / minMs);
          setProgress(shown);
          var x = LX + LW * shown, y = 8 + (LY - 36 - 8) * shown;
          rig.setAttribute('transform', 'translate(' + x + ' ' + y + ') rotate(' + Math.sin(now / 220) * 8 + ')');
          var kb = blob || total > 1 ? ' · ' + (shown * total / 1024).toFixed(0) + ' / ' + (total / 1024).toFixed(0) + ' KB' : '';
          status.innerHTML = '<b>' + Math.round(shown * 100) + '%</b>' + kb;
          shown >= 1 && finished ? res() : requestAnimationFrame(tick);
        })(t0);
      });
    }).then(function () {
      btn.classList.remove('busy');
      return animar(1, 0, 650);
    }).then(function () {
      btn.classList.add('done');
      estado = 'done';
      status.innerHTML = '<b>' + (es() ? 'Descargado' : 'Downloaded') + '</b> · CV_Alcide_Hinojosa_EN.pdf';
      var a = document.createElement('a');
      a.href = blob ? URL.createObjectURL(blob) : CV_URL;
      a.download = 'CV_Alcide_Hinojosa_EN.pdf';
      document.body.appendChild(a); a.click(); a.remove();
      if (blob) setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    });
  });
})();