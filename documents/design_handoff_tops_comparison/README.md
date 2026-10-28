# Handoff: TOPS Hero Redesign Comparison — Before/After Slider

## Overview
An animated before/after comparison of the old vs. new TOPS hero design, shown inside a tablet-style device mockup. Plays a short automatic sweep demo, settles at center, then becomes a manually draggable before/after slider (horizontal, left/right). Built for a portfolio piece.

## About the Design Files
The files here are **design references built in HTML/React** (via an internal prototyping tool), not production code to paste as-is. Recreate this in your target environment (React app, Next.js, static site, etc.) using its existing conventions.

## Fidelity
**High-fidelity.** Colors, layout, timing, copy, and interaction states below are final.

## Behavior overview
1. **Auto demo (0–6s)**: the divider sweeps left/right (damped sine wave, amplitude decays to 0), settling exactly centered at 6s.
2. **Manual mode (after 6s, permanent)**: divider stops animating and becomes user-draggable — grab anywhere near the divider (36px-wide hit zone) and drag left/right. Cursor becomes `ew-resize`.
3. A "← Drag to compare →" hint pill (bottom-center, above the badges) shows early during the auto phase (fades in ~0.4s, holds to 2.4s, fades out by 3s), then reappears once manual mode begins and stays until the user's first drag.

## Screens / Views
**Tablet mockup card**
- Outer bezel: `#1c1c1e`, border-radius 36px, padding 22px, centered flex column, shadow `0 40px 100px rgba(0,0,0,0.5)`.
- Camera dot: 6×6px circle, `#3a3a3c`, above screen.
- Screen: 1100×700px white rounded rect (radius 12px), overflow hidden.
- Home indicator: 90×5px rounded bar, `#3a3a3c`, below screen.
- Bezel has a continuous subtle scale pulse (1.0–1.01) tied to the sine wave.

**Browser chrome (inside screen)**
- Bar: 44px tall, `#ececec` bg, `#ddd` bottom border. Traffic-light dots (11px: `#ff5f57`, `#febc2e`, `#28c840`), then a white rounded (6px) URL pill: `topspersoneel.nl`, `#888`, 12px.

**Comparison area (1100×656px)**
- **After layer** (base): new design screenshot, `object-fit: contain; object-position: top`, full width/height.
- **Before layer** (top, revealed left of divider via `clip-path: inset(0 X% 0 0)`, X = `100 - dividerFrac*100`, extended 2px past the edge to avoid an anti-aliasing seam): old design image, zoomed to 150% width and centered (`margin-left: -25%`) so it fills the frame without side letterboxing, `height: auto`, `object-fit: contain`, top-aligned. No overlay/gradient — image renders as-is.
- No visible divider line — the drag handle alone marks the position (a thin line was removed per design direction).
- Handle: 40×40px white circle centered on the divider, 10px light-gray (`#c9c9c9`) inner dot. Scales up to 1.12× while dragging, up to 1.06× during the hint phase.
- **Before badge**: bottom-left, 14px from bottom / 18px from left. Pill (radius 999), background `rgba(120,120,120,0.5)`, white text, 13px/600, uppercase, letter-spacing 0.2, 1px `rgba(255,255,255,0.25)` border, `backdrop-filter: blur(14px) saturate(160%)`, shadow `0 4px 16px rgba(0,0,0,0.18)`. Text: "BEFORE".
- **After badge**: bottom-right, same shape/blur treatment, background `rgba(213,255,145,0.55)` (lime), dark text `#1c1c1e`, border `rgba(255,255,255,0.35)`. Text: "AFTER".
- Each badge fades out (opacity → 0) once its side is fully hidden (within ~5% of the divider hitting that edge), fades back in as soon as any of it is visible.
- Hint pill: bottom-center, 66px from bottom, black 55%-opacity rounded pill, white 15px/600 text: "← Drag to compare →".

## Interactions & Behavior
- **Auto sweep**: `dividerFrac = 0.5 + 0.48 * envelope * sin(2π * 1.6 * t / 6)`, `envelope = max(0, 1 - t/6)` — decays to exactly 0.5 at t=6s.
- **Drag**: pointer-events (`onPointerDown/Move/Up` with pointer capture) on the drag strip; `dividerFrac` from `(clientX - containerLeft) / containerWidth`, clamped to `[0.02, 0.98]`.
- **Badge visibility**: `oldOpacity = clamp((dividerFrac-0.03)/0.05, 0, 1)`, `newOpacity = clamp((0.97-dividerFrac)/0.05, 0, 1)`.
- No click/nav elsewhere — self-contained comparison widget.

## State Management
- `manualFrac` (number | null): user-set divider position once dragging starts; null = not yet dragged.
- `dragging` (boolean): true while pointer is down, drives handle scale-up.
- Single elapsed-time value (0–6s, then frozen) drives the auto phase; once elapsed ≥ 6s (or `manualFrac` set), permanently in manual mode.

## Design Tokens
- Bezel dark: `#1c1c1e`; bezel details: `#3a3a3c`
- Browser chrome: `#ececec` bar / `#ddd` border / `#888` url text
- Before badge: `rgba(120,120,120,0.5)` bg, `#fff` text
- After badge: `rgba(213,255,145,0.55)` bg, `#1c1c1e` text
- Canvas background: `oklch(0.24 0.01 90)` (warm near-black)
- Font: Helvetica/Arial, system sans
- Card corner radius: 36px (bezel), 12px (screen)

## Assets
- `Screenshot 2026-07-24 at 16.09.19.png` — new TOPS hero design
- `tops_old hero.png` — old TOPS hero design (rendered zoomed 150%/centered, no crop/letterbox)

## Files
- `TOPS Comparison.dc.html` — entry point / scene + tweak-defaults wiring
- `tops-compare-scene.jsx` — the comparison visual + all interaction logic (source of truth for the spec above)
- `tops-comparison-app.jsx` — wires the scene into the stage + tweaks panel
- `animations-v2.jsx`, `tweaks-panel.jsx` — internal prototyping-tool runtime helpers; reference only, not required in a rebuild
