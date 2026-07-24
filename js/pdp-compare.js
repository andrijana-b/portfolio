/**
 * pdp-compare.js
 * Before/after drag-to-compare slider for the Verstegen PDP screenshots.
 * Auto-sweeps the divider for 6s (damped sine wave, settles at center),
 * then hands off to manual pointer-drag control permanently.
 */

(function () {
  'use strict';

  const AUTO_DURATION = 6000; // ms

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function initCompare(root) {
    const area = root.querySelector('.pdp-compare__area');
    const strip = root.querySelector('[data-pdp-compare-strip]');
    const oldImg = root.querySelector('.pdp-compare__img--old');
    const divider = root.querySelector('.pdp-compare__divider');
    const beforeBadge = root.querySelector('.pdp-compare__badge--before');
    const afterBadge = root.querySelector('.pdp-compare__badge--after');
    const hint = root.querySelector('.pdp-compare__hint');
    if (!area || !strip || !oldImg || !divider) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let manual = reducedMotion;
    let dragging = false;
    let frac = 0.5;
    let rafId = null;
    let startTime = null;

    function render() {
      const pct = frac * 100;
      oldImg.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      divider.style.left = `${pct}%`;
      strip.style.left = `${pct}%`;
      const handle = root.querySelector('.pdp-compare__handle');
      if (handle) handle.style.left = `${pct}%`;

      if (beforeBadge) {
        beforeBadge.style.opacity = String(clamp((frac - 0.03) / 0.05, 0, 1));
      }
      if (afterBadge) {
        afterBadge.style.opacity = String(clamp((0.97 - frac) / 0.05, 0, 1));
      }
    }

    function setHintVisible(visible) {
      if (hint) hint.classList.toggle('is-visible', visible);
    }

    function enterManualMode() {
      if (manual) return;
      manual = true;
      area.classList.add('is-manual');
      area.classList.remove('is-hint');
      setHintVisible(true);
    }

    function autoStep(timestamp) {
      if (startTime === null) startTime = timestamp;
      const t = timestamp - startTime;

      if (t <= 2400) {
        setHintVisible(true);
        area.classList.add('is-hint');
      } else if (t <= 3000) {
        setHintVisible(false);
      }

      if (t >= AUTO_DURATION) {
        frac = 0.5;
        render();
        enterManualMode();
        return;
      }

      const envelope = Math.max(0, 1 - t / AUTO_DURATION);
      const seconds = t / 1000;
      frac = clamp(0.5 + 0.48 * envelope * Math.sin(2 * Math.PI * 1.6 * seconds / 6), 0.02, 0.98);
      render();
      rafId = requestAnimationFrame(autoStep);
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const rect = area.getBoundingClientRect();
      frac = clamp((e.clientX - rect.left) / rect.width, 0.02, 0.98);
      render();
    }

    function onPointerUp(e) {
      dragging = false;
      area.classList.remove('is-dragging');
      try { strip.releasePointerCapture(e.pointerId); } catch (err) { /* no-op */ }
    }

    function onPointerDown(e) {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      enterManualMode();
      setHintVisible(false);
      dragging = true;
      area.classList.add('is-dragging');
      strip.setPointerCapture(e.pointerId);
      onPointerMove(e);
    }

    strip.addEventListener('pointerdown', onPointerDown);
    strip.addEventListener('pointermove', onPointerMove);
    strip.addEventListener('pointerup', onPointerUp);
    strip.addEventListener('pointercancel', onPointerUp);

    render();

    if (reducedMotion) {
      area.classList.add('is-manual');
    } else {
      rafId = requestAnimationFrame(autoStep);
    }
  }

  document.querySelectorAll('[data-pdp-compare]').forEach(initCompare);
})();
