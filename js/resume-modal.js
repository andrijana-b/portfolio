/**
 * resume-modal.js — Shared "CV" preview modal, included on every page
 * (homepage + all case studies) so clicking CV always opens the same
 * in-page preview instead of immediately downloading. Closes on
 * Escape, backdrop click, or the ESC button; the download button
 * inside still triggers the real PDF download.
 */
(function () {
  'use strict';

  const modal = document.getElementById('resumeModal');
  if (!modal) return;

  const cvLinks = document.querySelectorAll('[data-resume-trigger]');
  if (!cvLinks.length) return;

  let lastTrigger = null;

  function open(trigger) {
    lastTrigger = trigger;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  }

  cvLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      open(link);
    });
  });

  modal.querySelectorAll('[data-resume-close]').forEach((el) => {
    el.addEventListener('click', close);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
})();
