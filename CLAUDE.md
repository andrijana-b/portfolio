# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Static site — pure HTML5, CSS3, and vanilla JavaScript. No build tool, no package manager, no framework, no dependencies.

## Running locally

Open `index.html` directly in a browser, or serve with any static server:

```bash
python3 -m http.server 8000
# or
npx serve .
```

There are no build, lint, or test commands.

## Architecture

Single HTML file (`index.html`) with modular CSS and minimal JS:

```
css/
  tokens.css       # All design tokens — change values here first
  reset.css
  typography.css
  layout.css
  components.css   # Header, footer, project cards, stat blocks
  animations.css   # Scroll-reveal, stagger, parallax keyframes/classes
  responsive.css   # Breakpoints: 390px (mobile), 768px (tablet), 1280px, 1440px+
js/
  main.js          # Smooth-scroll for anchor links
  animations.js    # IntersectionObserver scroll-reveal, auto-stagger, rAF parallax
```

## CSS conventions

- All values come from CSS custom properties defined in `tokens.css` — never hardcode colors, spacing, or timing.
- Naming follows BEM-like patterns: `.project__title`, `.site-header__name`.
- Responsive strategy: mobile-first with `@media (max-width: 767px)` overrides, then tablet/desktop breakpoints.

## Motion system (`animations.js`)

- **Scroll-reveal**: Add `data-animate` attribute to any element; `IntersectionObserver` adds `.is-visible`.
- **Stagger**: Add `data-stagger` to a parent; children animate in sequence with 100ms delays.
- **Parallax**: Applied to full-bleed images; uses `requestAnimationFrame`, disabled on mobile.
- All animations respect `prefers-reduced-motion` — no special handling needed in new code.

## Content structure (`index.html`)

Sections in order: sticky header nav → hero (tagline + 3-col info grid) → 6 project case studies → testimonial → footer.
