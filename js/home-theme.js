/**
 * home-theme.js — Theme toggle for the homepage. The homepage is dark
 * by default (:root tokens); toggling adds .theme-light to switch to
 * a light theme. The choice is kept in sessionStorage ("sw-theme",
 * shared with the case-study pages) so it carries across pages during a
 * visit, but every new visit starts dark again.
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
      sessionStorage.setItem(STORAGE_KEY, isLight() ? 'light' : 'dark');
    } catch (e) { /* storage unavailable — choice won't carry over */ }
    updateToggle();
  });

  updateToggle();
})();
