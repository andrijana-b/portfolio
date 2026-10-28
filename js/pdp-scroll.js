/**
 * pdp-scroll.js
 * Auto-scrolling phone mockup for TEVEO PDP screenshots.
 * Loops a slow scroll through the design on a timer; hovering pauses the
 * loop and hands off to manual scroll, resuming from the same position
 * on mouse leave. Each instance reads its own screenshot geometry from
 * data attributes on the image (defaults match the first PDP mockup).
 */

(function () {
  'use strict';

  const DEFAULT_NATURAL_W = 1179;
  const DEFAULT_NATURAL_H = 11403;
  const DEFAULT_NATIVE_CUTOFF = 11133; // native-px y just above the screenshot's own bottom CTA bar

  function computeScroll(frameWidth, frameHeight, naturalW, naturalH, nativeCutoff) {
    const scale = frameWidth / naturalW;
    const imgHeightPx = naturalH * scale;
    const targetBottomPx = nativeCutoff * scale;
    const maxScrollPx = Math.max(0, Math.min(targetBottomPx - frameHeight, imgHeightPx - frameHeight));
    const endPct = imgHeightPx > 0 ? -(maxScrollPx / imgHeightPx * 100) : 0;
    return { maxScrollPx, endPct };
  }

  function initScroll(root) {
    const area = root.querySelector('[data-pdp-scroll-area]');
    const img = root.querySelector('[data-pdp-scroll-img]');
    const clamp = root.querySelector('[data-pdp-scroll-clamp]');
    if (!area || !img) return;

    const frame = root.querySelector('.pdp-scroll__frame');
    const frameWidth = frame.offsetWidth || 340;
    const frameHeight = frame.offsetHeight || 736;

    const naturalW = Number(img.dataset.naturalW) || DEFAULT_NATURAL_W;
    const naturalH = Number(img.dataset.naturalH) || DEFAULT_NATURAL_H;
    const nativeCutoff = Number(img.dataset.nativeCutoff) || DEFAULT_NATIVE_CUTOFF;

    let { maxScrollPx, endPct } = computeScroll(frameWidth, frameHeight, naturalW, naturalH, nativeCutoff);

    // data-clear-cta: scroll on past the end by the height of the Add to Cart
    // bar laid over the screen, so the end of the design isn't hidden behind it
    const cta = root.querySelector('.pdp-scroll__cta');
    if (cta && img.hasAttribute('data-clear-cta')) {
      const extra = cta.offsetHeight;
      const imgHeightPx = naturalH * (frameWidth / naturalW);
      img.style.marginBottom = extra + 'px';
      maxScrollPx += extra;
      endPct = -(maxScrollPx / imgHeightPx * 100);
    }
    img.style.setProperty('--endY', endPct.toFixed(2) + '%');

    if (clamp) {
      clamp.style.height = Math.round(frameHeight + maxScrollPx) + 'px';
    }

    // Current auto-scroll offset of the image, in px (0 or negative)
    const currentShift = () => {
      const t = getComputedStyle(img).transform;
      return t && t !== 'none' ? new DOMMatrixReadOnly(t).m42 : 0;
    };

    // On hover the auto-scroll stops and the same position becomes a real
    // scroll position, so manual scrolling can't run past the end of the
    // design (it used to add on top of the paused shift and show black)
    area.addEventListener('mouseenter', () => {
      const shift = currentShift();
      img.classList.add('is-manual');
      area.classList.add('is-hovering');
      area.scrollTop = -shift;
    });

    // On leave the auto-scroll picks up from wherever the visitor left it
    area.addEventListener('mouseleave', () => {
      const target = -area.scrollTop;
      area.classList.remove('is-hovering');
      area.scrollTop = 0;
      img.classList.remove('is-manual');
      const anim = img.getAnimations()[0];
      if (!anim || !maxScrollPx) return;
      const duration = anim.effect.getTiming().duration;
      // The loop holds still for the first 12%, scrolls until 88%, then
      // holds again; find the moment whose offset matches the position
      let lo = duration * 0.12, hi = duration * 0.88;
      anim.pause();
      for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2;
        anim.currentTime = mid;
        if (currentShift() > target) lo = mid; else hi = mid;
      }
      anim.currentTime = (lo + hi) / 2;
      anim.play();
    });
  }

  document.querySelectorAll('[data-pdp-scroll]').forEach(initScroll);
})();
