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
