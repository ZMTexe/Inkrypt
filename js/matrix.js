'use strict';

const Matrix = (() => {
  let canvas, ctx, cols, drops, timer;
  const SZ = 14;

  function init() {
    canvas = document.getElementById('matrix-bg');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    if (!canvas) return;
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
    ctx.font = `${SZ}px "Share Tech Mono", monospace`;
    for (let i = 0; i < cols; i++) {
      ctx.fillText(Math.random() > 0.5 ? '1' : '0', i * SZ, drops[i] * SZ);
      if (drops[i] * SZ > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  function start() {
    init();
    if (timer) clearInterval(timer);
    timer = setInterval(draw, 50);
  }

  return { start };
})();