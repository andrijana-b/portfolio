/**
 * preloader.js — Removes the homepage intro once the split animation
 * finishes and unlocks scrolling. The inline script after the preloader
 * markup decides whether it plays at all (once per session).
 */
(function () {
  'use strict';

  const preloader = document.querySelector('.preloader');
  if (!preloader) return;

  let done = false;
  function finish() {
    if (done) return;
    done = true;
    preloader.remove();
    document.body.classList.remove('is-preloading');
  }

  const bottom = preloader.querySelector('.preloader__half--bottom');
  if (bottom) {
    bottom.addEventListener('animationend', (e) => {
      if (e.animationName === 'preloader-split') finish();
    });
  }

  // Safety net in case animations don't run (e.g. tab in background)
  setTimeout(finish, 6000);
})();
