'use strict';

const Matrix = (() => {
  const canvas = document.getElementById('matrix-bg');
  const ctx    = canvas ? canvas.getContext('2d') : null;
  const SZ     = 14;
  let cols = 0, drops = [];

  function init() {
    if (!canvas || !ctx) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols  = Math.floor(canvas.width / SZ);
    drops = Array.from({ length: cols }, () => (Math.random() * -100) | 0);
  }

  function draw() {
    if (!ctx || !canvas) return;
    ctx.fillStyle = 'rgba(8,11,16,0.18)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00f5c4';
    ctx.font      = `${SZ}px "Share Tech Mono", monospace`;
    for (let i = 0; i < cols; i++) {
      ctx.fillText(Math.random() > 0.5 ? '1' : '0', i * SZ, drops[i] * SZ);
      if (drops[i] * SZ > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  function start() {
    init();
    setInterval(draw, 50);
    window.addEventListener('resize', init);
  }

  return { start };
})();