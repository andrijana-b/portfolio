/**
 * animations.js — Motion design system
 *
 * 1. Scroll-reveal    IntersectionObserver → [data-animate], [data-stagger]
 * 2. Auto-stagger     .project__row and .stats-row children cascade in
 * 3. Parallax         Full-bleed images get subtle vertical offset on scroll
 *                     (desktop only, rAF-throttled, passive listener)
 */

(function () {
  'use strict';

  /* ── Bail out if user prefers reduced motion ─────────────── */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const isMobile = window.matchMedia('(max-width: 767px)').matches;


  /* ══════════════════════════════════════════════════════════
     1. SCROLL REVEAL — IntersectionObserver
     ══════════════════════════════════════════════════════════ */

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold:   isMobile ? 0.06 : 0.10,
      rootMargin:  isMobile ? '0px 0px -20px 0px' : '0px 0px -80px 0px',
    }
  );

  /* Observe existing [data-animate] and [data-stagger] elements */
  document.querySelectorAll('[data-animate], [data-stagger]').forEach((el) => {
    revealObserver.observe(el);
  });


  /* ══════════════════════════════════════════════════════════
     2. AUTO-STAGGER — project rows and stat blocks
        Adds [data-stagger] at runtime so HTML stays lean
     ══════════════════════════════════════════════════════════ */

  document.querySelectorAll('.project__row, .stats-row').forEach((el) => {
    /* Skip if already managed */
    if (el.hasAttribute('data-stagger') || el.hasAttribute('data-animate')) return;
    el.setAttribute('data-stagger', '');
    revealObserver.observe(el);
  });


  /* ══════════════════════════════════════════════════════════
     3. PARALLAX — full-bleed images, desktop only
        Translates the <img> vertically as the section scrolls.
        Range: ±30px · scale(1.08) provides the headroom.
     ══════════════════════════════════════════════════════════ */

  if (!isMobile) {
    const parallaxSections = Array.from(
      document.querySelectorAll('.full-bleed')
    );

    let rafId   = null;
    let lastScrollY = -1;

    function applyParallax() {
      rafId = null;
      const scrollY    = window.scrollY;
      const viewportH  = window.innerHeight;

      /* Skip if scroll hasn't changed (resize or forced call) */
      if (scrollY === lastScrollY) return;
      lastScrollY = scrollY;

      parallaxSections.forEach((section) => {
        const img = section.querySelector('img');
        if (!img) return;

        const rect     = section.getBoundingClientRect();
        const inView   = rect.bottom > 0 && rect.top < viewportH;
        if (!inView) return;

        /* progress 0 = section top at viewport bottom
                    1 = section bottom at viewport top  */
        const progress = (viewportH - rect.top) / (viewportH + rect.height);
        /* offset range: -30px → +30px */
        const offset   = (progress - 0.5) * 60;

        img.style.transform = `translateY(${offset.toFixed(2)}px) scale(1.08)`;
      });
    }

    /* Passive scroll listener, rAF-throttled */
    window.addEventListener('scroll', () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(applyParallax);
      }
    }, { passive: true });

    /* Run once on load to position images correctly */
    applyParallax();
  }

})();
