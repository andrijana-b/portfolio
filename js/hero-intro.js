/**
 * hero-intro.js
 * "Read full intro" in the hero ([data-intro]): swaps the short value
 * statement for the full About paragraph, and "Show less" swaps it back.
 */

(function () {
  'use strict';

  const intro = document.querySelector('[data-intro]');
  if (!intro) return;

  const lead = intro.querySelector('.hero__lead');
  const full = intro.querySelector('.hero__full');
  const btn = intro.querySelector('[data-intro-more]');
  const label = btn.querySelector('.hero__more-label');

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') !== 'true';
    lead.hidden = expanded;
    full.hidden = !expanded;
    intro.classList.toggle('is-expanded', expanded);
    btn.setAttribute('aria-expanded', String(expanded));
    label.textContent = expanded ? 'Show less' : 'Read full intro';
  });
})();
