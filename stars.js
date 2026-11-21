/* Cielo de estrellas parpadeando de fondo en la sección de Contacto. */
(function () {
  var section = document.getElementById('contact');
  if (!section) return;

  var css = `
#contact{position:relative;overflow:hidden}
#contact > .wrap{position:relative;z-index:1}
#stars{position:absolute;inset:0;pointer-events:none;z-index:0}
#stars .star{position:absolute;line-height:1;color:#9BBEFF;opacity:0;text-shadow:0 0 6px rgba(76,130,255,.8);animation-name:twinkle;animation-timing-function:ease-in-out;animation-iteration-count:infinite}
@keyframes twinkle{0%,100%{opacity:0;transform:scale(.5) rotate(0)}50%{opacity:.9;transform:scale(1) rotate(20deg)}}
@media (prefers-reduced-motion:reduce){#stars .star{animation:none;opacity:.5}}
`;
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var starsContainer = document.createElement('div');
  starsContainer.id = 'stars';
  starsContainer.setAttribute('aria-hidden', 'true');
  section.insertBefore(starsContainer, section.firstChild);

  var totalStars = window.innerWidth < 760 ? 30 : 45;
  for (var i = 0; i < totalStars; i++) {
    var star = document.createElement('span');
    star.classList.add('star');
    star.innerHTML = Math.random() > 0.5 ? '✦' : '✧';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.fontSize = Math.random() * 12 + 6 + 'px';
    star.style.animationDelay = Math.random() * 3 + 's';
    star.style.animationDuration = Math.random() * 3 + 2 + 's';
    starsContainer.appendChild(star);
  }
})();