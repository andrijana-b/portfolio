/**
 * animations.js — Motion design system
 *
 * 1. Scroll-reveal    IntersectionObserver → [data-animate], [data-stagger]
 * 2. Auto-stagger     .project__row and .stats-row children cascade in
 * 3. Parallax         Layered depth: full-bleed images shift in their frames
 *                     and [data-parallax] elements drift at their own speed
 *                     (desktop only, eased, rAF-driven, passive listener)
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
     3. PARALLAX — layered depth, desktop only
        • Full-bleed images: the <img> shifts inside its frame
          (±45px, scale(1.08) gives the headroom).
        • [data-parallax="speed"]: the element itself drifts as it
          passes through the viewport. Positive speeds lag behind the
          scroll (feel further away), negative speeds run ahead (feel
          closer). Uses the `translate` property so it combines with
          the scroll-reveal `transform` instead of replacing it.
        • [data-parallax-mode="scroll"]: offset follows scrollY from the
          top of the page — for hero layers, so nothing jumps on load.
        • [data-parallax-fade]: also fades out as it scrolls away.
        Movement is eased towards its target each frame, so it glides.
     ══════════════════════════════════════════════════════════ */

  if (!isMobile) {
    const MAX_SHIFT = 140;   // px, keeps big speeds in check
    const EASE = 0.12;       // 0–1, how quickly layers catch up

    const frames = Array.from(document.querySelectorAll('.full-bleed:not(.full-bleed--static)'))
      .map((section) => ({ section, img: section.querySelector('img'), cur: 0, target: 0 }))
      .filter((f) => f.img);

    const layers = Array.from(document.querySelectorAll('[data-parallax]')).map((el) => ({
      el,
      speed: parseFloat(el.dataset.parallax) || 0,
      byScroll: el.dataset.parallaxMode === 'scroll',
      fade: el.hasAttribute('data-parallax-fade'),
      cur: 0,
      target: 0,
      opacity: 1,
    }));

    let rafId = null;

    function measure() {
      const viewportH = window.innerHeight;
      const scrollY = window.scrollY;

      frames.forEach((f) => {
        const rect = f.section.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > viewportH + 200) return;
        /* progress 0 = section top at viewport bottom
                    1 = section bottom at viewport top  */
        const progress = (viewportH - rect.top) / (viewportH + rect.height);
        f.target = (progress - 0.5) * 90;
      });

      layers.forEach((l) => {
        let shift;
        if (l.byScroll) {
          shift = scrollY * l.speed;
          if (l.fade) l.opacity = Math.max(0, 1 - scrollY / (viewportH * 0.85));
        } else {
          // Distance of the element's (unshifted) centre from the viewport centre
          const rect = l.el.getBoundingClientRect();
          if (rect.bottom < -300 || rect.top > viewportH + 300) return;
          const centre = rect.top + rect.height / 2 - l.cur;
          shift = (viewportH / 2 - centre) * l.speed;
        }
        l.target = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, shift));
      });
    }

    function render() {
      rafId = null;
      measure();
      let moving = false;

      frames.forEach((f) => {
        f.cur += (f.target - f.cur) * EASE;
        if (Math.abs(f.target - f.cur) > 0.1) moving = true;
        f.img.style.transform = `translateY(${f.cur.toFixed(2)}px) scale(1.08)`;
      });

      layers.forEach((l) => {
        l.cur += (l.target - l.cur) * EASE;
        if (Math.abs(l.target - l.cur) > 0.1) moving = true;
        l.el.style.translate = `0 ${l.cur.toFixed(2)}px`;
        if (l.fade) l.el.style.opacity = l.opacity.toFixed(3);
      });

      // Keep easing until everything has settled
      if (moving) rafId = requestAnimationFrame(render);
    }

    function schedule() {
      if (rafId === null) rafId = requestAnimationFrame(render);
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    // Start settled so nothing jumps on load
    measure();
    frames.forEach((f) => { f.cur = f.target; });
    layers.forEach((l) => { l.cur = l.target; });
    render();
  }

})();
