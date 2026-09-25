/**
 * home-theme.js — Theme toggle for the homepage. The homepage is dark
 * by default (:root tokens); toggling adds .theme-light to switch to
 * a light theme. Shares the "sw-theme" localStorage key with the
 * case-study pages' toggle, so the preference is consistent site-wide
 * even though each page's default direction is opposite.
 */
(function () {
  'use strict';

  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  const STORAGE_KEY = 'sw-theme';

  function isLight() {
    return document.body.classList.contains('theme-light');
  }

  function updateToggle() {
    const light = isLight();
    toggle.setAttribute('aria-pressed', String(light));
    toggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
  }

  toggle.addEventListener('click', () => {
    document.body.classList.toggle('theme-light');
    try {
      localStorage.setItem(STORAGE_KEY, isLight() ? 'light' : 'dark');
    } catch (e) { /* localStorage unavailable — preference won't persist */ }
    updateToggle();
  });

  updateToggle();
})();
