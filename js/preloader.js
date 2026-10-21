/**
 * preloader.js — Homepage intro.
 *
 * 1. Draws the pink opening: the screen is pink, then breaks into
 *    squares that pop away in random order, revealing the white screen.
 * 2. Removes the intro once the screen has split open and unlocks
 *    scrolling.
 *
 * The rest of the animation is CSS (preloader.css). The inline script
 * after the preloader markup decides whether it plays at all (once per
 * session).
 */
(function () {
  'use strict';

  const preloader = document.querySelector('.preloader');
  if (!preloader) return;

  let done = false;
  function finish() {
    if (done) return;
    done = true;
    preloader.remove();
    document.body.classList.remove('is-preloading');
  }

  // ── 1. Pink squares ─────────────────────────────────────────
  const canvas = preloader.querySelector('.preloader__squares');
  const ctx = canvas && canvas.getContext('2d');
  if (ctx) {
    const PINK = getComputedStyle(preloader).getPropertyValue('--preloader-pink').trim() || '#D855D8';
    const HOLD = 150;      // solid pink before the first square goes
    const SPREAD = 550;    // squares pop over this window

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = preloader.clientWidth;
    const H = preloader.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cols = Math.max(6, Math.round(W / 110));
    const size = W / cols;
    const rows = Math.ceil(H / size);
    const squares = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        squares.push({ x: c * size, y: r * size, t: HOLD + Math.random() * SPREAD });
      }
    }

    canvas.classList.add('is-drawing');
    let startTime = null;
    const draw = (now) => {
      if (done) return;
      if (startTime === null) startTime = now;
      const t = now - startTime;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = PINK;
      let left = 0;
      for (const s of squares) {
        if (t >= s.t) continue;
        left++;
        // Each square shrinks slightly in the last moment before it pops
        const k = Math.min(1, (s.t - t) / 90);
        const inset = (1 - k) * size * 0.18;
        ctx.fillRect(s.x + inset, s.y + inset, size - inset * 2 + 0.5, size - inset * 2 + 0.5);
      }
      if (left > 0) requestAnimationFrame(draw);
      else canvas.remove();
    };
    requestAnimationFrame(draw);
  }

  // ── 2. Done when the bottom half has slid away ─────────────
  const bottom = preloader.querySelector('.preloader__half--bottom');
  if (bottom) {
    bottom.addEventListener('animationend', (e) => {
      if (e.animationName === 'preloader-split') finish();
    });
  }

  // Safety net in case animations don't run (e.g. tab in background)
  setTimeout(finish, 7500);
})();
