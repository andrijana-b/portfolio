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

    const { maxScrollPx, endPct } = computeScroll(frameWidth, frameHeight, naturalW, naturalH, nativeCutoff);
    img.style.setProperty('--endY', endPct.toFixed(2) + '%');

    if (clamp) {
      clamp.style.height = Math.round(frameHeight + maxScrollPx) + 'px';
    }

    area.addEventListener('mouseenter', () => {
      area.classList.add('is-hovering');
      img.classList.add('is-paused');
    });

    area.addEventListener('mouseleave', () => {
      area.scrollTop = 0;
      area.classList.remove('is-hovering');
      img.classList.remove('is-paused');
    });
  }

  document.querySelectorAll('[data-pdp-scroll]').forEach(initScroll);
})();
