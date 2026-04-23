// Particle system for landing page
(function () {
  const container = document.getElementById('particles');
  if (!container) return;

  const COUNT = 32;

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size = 3 + Math.random() * 10;
    const left = Math.random() * 100;
    const duration = 10 + Math.random() * 18;
    const delay = Math.random() * duration;

    p.style.cssText =
      'width:' + size + 'px;' +
      'height:' + size + 'px;' +
      'left:' + left + '%;' +
      'bottom:-20px;' +
      'animation-duration:' + duration + 's;' +
      'animation-delay:-' + delay + 's;';

    container.appendChild(p);
  }
})();
