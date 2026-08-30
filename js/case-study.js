/**
 * case-study.js — Scroll-spy for the "Contents" sidebar
 * Highlights the sidebar link matching the section currently in view.
 */

(function () {
  'use strict';

  const links = document.querySelectorAll('.cs-sidebar__link');
  if (!links.length) return;

  const sections = Array.from(links)
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  function onScroll() {
    const pos = window.scrollY + 160;
    let current = sections[0];
    sections.forEach((section) => {
      if (section.offsetTop <= pos) current = section;
    });
    links.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${current.id}`);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/**
 * Lightbox — click (or Enter/Space) a .cs-zoomable image to view it enlarged.
 * Closes on the image itself, the backdrop, the close button, or Escape.
 */
(function () {
  'use strict';

  const zoomables = document.querySelectorAll('.cs-zoomable');
  if (!zoomables.length) return;

  const lightbox = document.createElement('div');
  lightbox.className = 'cs-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Enlarged image');
  lightbox.innerHTML =
    '<button type="button" class="cs-lightbox__close" aria-label="Close">&times;</button>' +
    '<img class="cs-lightbox__img" alt="">';
  document.body.appendChild(lightbox);

  const img = lightbox.querySelector('.cs-lightbox__img');
  const closeBtn = lightbox.querySelector('.cs-lightbox__close');
  let lastTrigger = null;

  function open(el) {
    lastTrigger = el;
    img.src = el.currentSrc || el.src;
    img.alt = el.alt || '';
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('.cs-zoomable');
    if (trigger) {
      event.preventDefault();
      open(trigger);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
      close();
      return;
    }
    const trigger = event.target.closest && event.target.closest('.cs-zoomable');
    if (trigger && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      open(trigger);
    }
  });

  closeBtn.addEventListener('click', close);

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox || event.target === img) close();
  });
})();
