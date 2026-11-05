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
    lightbox.classList.toggle('cs-lightbox--light', !!el.closest('.cs-media-card--always-light'));
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

/**
 * Theme toggle — switches the case-study page between its default dark
 * theme (matching the homepage) and a light theme. The choice is kept
 * in sessionStorage so it carries across pages during a visit, but every
 * new visit starts dark; the initial class is applied by an inline
 * script at the top of <body> to avoid a flash of the wrong theme.
 */
(function () {
  'use strict';

  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  const STORAGE_KEY = 'sw-theme';

  function isDark() {
    return document.body.classList.contains('theme-dark');
  }

  function updateToggle() {
    const dark = isDark();
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  toggle.addEventListener('click', () => {
    document.body.classList.toggle('theme-dark');
    try {
      sessionStorage.setItem(STORAGE_KEY, isDark() ? 'dark' : 'light');
    } catch (e) { /* storage unavailable — choice won't carry over */ }
    updateToggle();
  });

  updateToggle();
})();

/**
 * Before / After — the toggle switches the device stage between the
 * original homepage and the scrollable redesign.
 */
(function () {
  'use strict';

  document.querySelectorAll('.cs-ba').forEach((stage) => {
    const options = stage.querySelectorAll('.cs-ba__option');

    options.forEach((option) => {
      option.addEventListener('click', () => {
        stage.dataset.view = option.dataset.view;
        options.forEach((o) => o.setAttribute('aria-pressed', String(o === option)));
      });
    });
  });
})();

/**
 * Prototype — scales each design page (laid out in design px) to its
 * device screen, and runs its carousels: arrows, live dots, snap, and
 * mouse drag (touch and trackpads scroll them natively).
 */
(function () {
  'use strict';

  const protos = document.querySelectorAll('.proto');
  if (!protos.length) return;

  const fit = (proto) => {
    const width = Number(proto.dataset.protoWidth) || 1440;
    proto.style.setProperty('--u', proto.clientWidth / width + 'px');
  };

  const observer = new ResizeObserver((entries) => entries.forEach((entry) => fit(entry.target)));
  protos.forEach((proto) => {
    fit(proto);
    observer.observe(proto);
  });

  document.querySelectorAll('.proto__track').forEach((track) => {
    const id = track.id;
    const slides = track.children;
    const prev = document.querySelector(`[data-proto-prev="${id}"]`);
    const next = document.querySelector(`[data-proto-next="${id}"]`);
    const dotsBox = document.querySelector(`[data-proto-dots="${id}"]`);
    const dots = [];

    if (dotsBox) {
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.className = 'proto__dot';
        dotsBox.appendChild(dot);
        dots.push(dot);
      }
    }

    const max = () => track.scrollWidth - track.clientWidth;
    const step = () => (slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth);

    const update = () => {
      const progress = max() > 0 ? track.scrollLeft / max() : 0;
      const active = Math.round(progress * (dots.length - 1));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
      if (prev) prev.disabled = track.scrollLeft <= 1;
      if (next) next.disabled = track.scrollLeft >= max() - 1;
    };

    if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', update, { passive: true });
    new ResizeObserver(update).observe(track);

    // Mouse drag; on release, settle on the nearest slide
    let startX = 0;
    let startLeft = 0;
    let dragging = false;

    track.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      dragging = true;
      startX = event.clientX;
      startLeft = track.scrollLeft;
      track.setPointerCapture(event.pointerId);
      track.classList.add('is-dragging');
    });

    track.addEventListener('pointermove', (event) => {
      if (dragging) track.scrollLeft = startLeft - (event.clientX - startX);
    });

    const release = () => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      const target = Math.round(track.scrollLeft / step()) * step();
      track.scrollTo({ left: Math.min(target, max()), behavior: 'smooth' });
    };

    track.addEventListener('pointerup', release);
    track.addEventListener('pointercancel', release);
    update();
  });
})();
