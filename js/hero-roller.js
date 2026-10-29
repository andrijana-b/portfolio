/**
 * hero-roller.js
 * Rolls the hero statement ([data-roller]) through the About text one
 * sentence at a time. Each sentence stays up long enough to read
 * (based on its word count), then rolls up as the next one rises in.
 *   - Controls: pause/play, previous/next, one progress segment per
 *     sentence (jumps to it) and a speed button (1× → 1.5× → 2×)
 *   - Arrow keys step through sentences while a control has focus;
 *     a horizontal swipe does the same on touch screens
 *   - "Read full intro" stops the roll and shows every sentence as one
 *     paragraph; "Show less" brings the roller back
 *   - Holds while the text is hovered, off screen or in a background tab
 *   - With prefers-reduced-motion it starts paused on the first sentence
 */

(function () {
  'use strict';

  const roller = document.querySelector('[data-roller]');
  if (!roller) return;

  const lines = [...roller.querySelectorAll('.hero__roller-line')];
  const progress = roller.querySelector('[data-roller-progress]');
  const toggle = roller.querySelector('.hero__roller-toggle');
  const prevBtn = roller.querySelector('[data-roller-prev]');
  const nextBtn = roller.querySelector('[data-roller-next]');
  const speedBtn = roller.querySelector('[data-roller-speed]');
  const moreBtn = roller.querySelector('[data-roller-more]');
  const track = roller.querySelector('.hero__roller-track');
  const moreLabel = moreBtn.querySelector('.hero__roller-more-label');

  const SPEEDS = [
    { rate: 1, label: '1×', name: 'normal' },
    { rate: 1.5, label: '1.5×', name: 'fast' },
    { rate: 2, label: '2×', name: 'fastest' },
  ];
  let speed = 0;

  // Reading time at 1×: ~300 words per minute (a skimming pace for short
  // headline copy) plus a short beat to take the sentence in
  const holdFor = (line) => {
    const words = line.textContent.trim().split(/\s+/).length;
    return Math.round((800 + words * 200) / SPEEDS[speed].rate);
  };

  const segs = lines.map((line, i) => {
    const seg = document.createElement('button');
    seg.type = 'button';
    seg.className = 'hero__roller-seg';
    seg.setAttribute('aria-label', 'Show sentence ' + (i + 1) + ' of ' + lines.length);
    progress.appendChild(seg);
    return seg;
  });

  let index = 0;
  let timer = null;
  let userPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let hovered = false;
  let inView = true;
  let expanded = false;

  const show = (next) => {
    if (next !== index) {
      const prev = lines[index];
      prev.classList.remove('is-active');
      prev.classList.add('is-leaving');
      setTimeout(() => prev.classList.remove('is-leaving'), 800);
    }
    index = next;
    lines[index].classList.add('is-active');

    roller.style.setProperty('--roller-hold', holdFor(lines[index]) + 'ms');
    segs.forEach((seg, i) => {
      seg.classList.toggle('is-done', i < index);
      seg.classList.remove('is-active');
      seg.setAttribute('aria-current', String(i === index));
    });
    void roller.offsetWidth;   // restart the fill animation
    segs[index].classList.add('is-active');
  };

  const running = () => !expanded && !userPaused && !hovered && inView && !document.hidden;

  const schedule = () => {
    clearTimeout(timer);
    roller.classList.toggle('is-paused', userPaused);   // button icon
    roller.classList.toggle('is-held', !running());     // freezes the progress fill
    toggle.setAttribute('aria-pressed', String(userPaused));
    toggle.setAttribute('aria-label', userPaused ? 'Play intro' : 'Pause intro');
    if (!running()) return;
    timer = setTimeout(() => {
      show((index + 1) % lines.length);
      schedule();
    }, holdFor(lines[index]));
  };

  // Re-showing the current sentence restarts its full hold, so the bar and timer agree
  const resume = () => { show(index); schedule(); };
  const go = (next) => { show((next + lines.length) % lines.length); schedule(); };

  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    if (userPaused) schedule(); else resume();
  });

  prevBtn.addEventListener('click', () => go(index - 1));
  nextBtn.addEventListener('click', () => go(index + 1));
  segs.forEach((seg, i) => seg.addEventListener('click', () => go(i)));

  speedBtn.addEventListener('click', () => {
    speed = (speed + 1) % SPEEDS.length;
    speedBtn.textContent = SPEEDS[speed].label;
    speedBtn.setAttribute('aria-label', 'Reading speed: ' + SPEEDS[speed].name + '. Change speed');
    resume();
  });

  moreBtn.addEventListener('click', () => {
    expanded = !expanded;
    roller.classList.toggle('is-expanded', expanded);
    moreBtn.setAttribute('aria-expanded', String(expanded));
    moreLabel.textContent = expanded ? 'Show less' : 'Read full intro';
    if (expanded) schedule(); else resume();
  });

  roller.addEventListener('keydown', (e) => {
    if (expanded) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
  });

  // Swipe left/right on the text (touch screens)
  let touchX = null;
  track.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    if (touchX === null || expanded) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
  }, { passive: true });

  // Hovering the text holds it for reading; the controls stay live
  track.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  track.addEventListener('mouseleave', () => { hovered = false; resume(); });
  document.addEventListener('visibilitychange', schedule);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      schedule();
    }).observe(roller);
  }

  show(0);
  schedule();
})();
