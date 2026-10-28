/**
 * main.js
 * Entry point — initialises all non-animation interactivity.
 * Currently handles:
 *   - Smooth-scroll for any internal anchor links
 *   - Lazy-loading videos marked with data-src (they only download and
 *     start playing when they come near the screen)
 *   - Lining up a project's side column with its "Problem" label
 *     ([data-align-problem])
 *   - Landing reliably on section links (e.g. index.html#verstegen-showcase),
 *     even while images above are still loading
 *   - Highlighter-pen marks on key words ([data-marker] paragraphs)
 */

(function () {
  'use strict';

  /**
   * Smooth-scroll polyfill for browsers that don't support
   * CSS `scroll-behavior: smooth` (mainly older Safari).
   */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /**
   * Lazy videos: <video data-src="…" muted loop playsinline preload="none">
   * Loads and plays the video when it's within ~600px of the viewport,
   * and pauses it again when it scrolls out of view.
   */
  const lazyVideos = document.querySelectorAll('video[data-src]');
  if (lazyVideos.length) {
    const loadAndPlay = (video) => {
      if (!video.src) {
        video.src = video.dataset.src;
        video.load();
      }
      const p = video.play();
      if (p && p.catch) p.catch(() => { /* autoplay blocked — leave paused */ });
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) loadAndPlay(entry.target);
          else if (entry.target.src) entry.target.pause();
        });
      }, { rootMargin: '600px 0px' });
      lazyVideos.forEach((v) => io.observe(v));
    } else {
      lazyVideos.forEach(loadAndPlay);
    }
  }

  /**
   * [data-align-problem] on a project's side column: pushes its first
   * label down so it starts on the same line as the "Problem" label in
   * the project info beside it. Only applies when the two sit side by
   * side; recalculated on resize and once fonts have loaded.
   */
  const alignCols = document.querySelectorAll('[data-align-problem]');
  if (alignCols.length) {
    const align = () => {
      alignCols.forEach((col) => {
        const row = col.closest('.project__row');
        const info = row && row.querySelector('.project__info');
        const label = col.querySelector('.section-label');
        const problem = info && [...info.querySelectorAll('.section-label')]
          .find((l) => l.textContent.trim().toLowerCase() === 'problem');
        if (!label || !problem) return;
        label.style.marginTop = '';
        const sideBySide = col.getBoundingClientRect().left >= info.getBoundingClientRect().right - 1;
        if (!sideBySide) return;
        const offset = problem.getBoundingClientRect().top - label.getBoundingClientRect().top;
        if (offset > 0) label.style.marginTop = offset + 'px';
      });
    };
    align();
    window.addEventListener('resize', align);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(align);
  }

  /**
   * [data-marker] paragraphs: each <strong> gets a highlighter-pen stroke
   * in the brand colours (green, purple, pink in turn), swiped in one
   * after another once the paragraph scrolls into view — so someone
   * skimming can read just the marked words.
   */
  const markerColours = [
    'rgba(156, 184, 109, 0.42)',   // --color-accent-green
    'rgba(181, 150, 194, 0.45)',   // --color-accent-purple
    'rgba(212, 77, 186, 0.38)',    // --color-accent (pink)
  ];
  document.querySelectorAll('[data-marker]').forEach((para) => {
    para.querySelectorAll('strong').forEach((word, i) => {
      word.style.setProperty('--marker', markerColours[i % markerColours.length]);
      word.style.transitionDelay = (150 + i * 140) + 'ms';
    });
    const mark = () => para.classList.add('is-marked');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { mark(); io.disconnect(); }
      }, { threshold: 0.35 });
      io.observe(para);
    } else {
      mark();
    }
  });

  /**
   * Arriving on a section link (#…): keep the target in place while the
   * page settles. Images and fonts loading above it can push it down, so
   * for the first few seconds every layout change re-aligns it — until
   * the visitor starts scrolling themselves.
   */
  if (location.hash.length > 1) {
    let target = null;
    try { target = document.querySelector(location.hash); } catch (e) { /* invalid selector */ }
    if (target) {
      const root = document.documentElement;
      let active = true;
      const stop = () => { active = false; };
      ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach((t) =>
        window.addEventListener(t, stop, { once: true, passive: true }));
      setTimeout(stop, 4000);

      // Layout position, ignoring transforms (the scroll-reveal shift and
      // parallax shouldn't move the landing spot)
      const layoutTop = (el) => {
        let y = 0;
        for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
        return y;
      };

      const settle = () => {
        if (!active) return;
        const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
        const y = Math.max(0, layoutTop(target) - margin);
        if (Math.abs(window.scrollY - y) < 2) return;
        const prev = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';   // jump, don't animate
        window.scrollTo(0, y);
        root.style.scrollBehavior = prev;
      };

      settle();
      requestAnimationFrame(settle);
      window.addEventListener('load', settle);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle);
      if ('ResizeObserver' in window) {
        const ro = new ResizeObserver(settle);
        ro.observe(document.body);
        setTimeout(() => ro.disconnect(), 4000);
      }
    }
  }
})();
