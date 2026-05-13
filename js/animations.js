/**
 * animations.js
 * Scroll-reveal using IntersectionObserver.
 * Adds `.is-visible` to elements with [data-animate] or [data-animate-stagger]
 * when they enter the viewport. Fires once per element, then stops observing.
 */

(function () {
  'use strict';

  /**
   * Check if the user prefers reduced motion.
   * If so, skip all JS-driven animation setup — CSS handles the fallback.
   */
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) return;

  /**
   * IntersectionObserver config:
   * - threshold 0.12  → trigger when 12% of the element is visible
   * - rootMargin      → shrink the bottom of the viewport by 60px
   *                     so elements animate slightly before they fully enter
   */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // fire once only
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  /**
   * Observe every element marked for animation.
   * Both individual [data-animate] and parent [data-animate-stagger]
   * nodes are observed — children are handled by CSS alone once the
   * parent receives `.is-visible`.
   */
  const targets = document.querySelectorAll(
    '[data-animate], [data-animate-stagger]'
  );

  targets.forEach((el) => observer.observe(el));
})();
