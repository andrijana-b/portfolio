/**
 * main.js
 * Entry point — initialises all non-animation interactivity.
 * Currently handles:
 *   - Smooth-scroll for any internal anchor links
 *   - Lazy-loading videos marked with data-src (they only download and
 *     start playing when they come near the screen)
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
})();
