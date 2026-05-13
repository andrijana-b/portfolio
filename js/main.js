/**
 * main.js
 * Entry point — initialises all non-animation interactivity.
 * Currently handles:
 *   - Smooth-scroll for any internal anchor links
 *   - Nothing else needed; site is intentionally minimal
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
})();
