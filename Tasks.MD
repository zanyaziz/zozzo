# Zozzo — Detailed Tasks & Milestones

This document breaks the Zozzo project into concrete milestones, design-focused UI tasks, and implementation work for the Claude-based game experience.

## Current milestone: Milestone 2 — Claude UI fidelity

Focus: polish the mobile UI, recreate the Claude screen look and feel, and complete the game board layout.

## Milestone 1 — UI foundation and core flow

### Goal
Build the first MVP of the Claude-designed Zozzo interface with the primary screens and a playable Bop-a-Mole flow.

### Tasks
- Create the splash/menu screen with:
  - prominent Zozzo branding
  - game selection card(s)
  - play CTA button
  - mobile-friendly spacing and safe edge padding
- Create the Bop-a-Mole game screen with:
  - score and timer HUD
  - 10 visible buttons laid out in a 2×5 grid on mobile
  - persistent unlit buttons in white
  - highlighted active buttons in red/yellow/purple
  - pause and quit controls
- Create the result/score screen with:
  - final score display
  - play again CTA
  - home/menu button
  - optional new high score badge or animation
- Wire the screen router/state transitions:
  - splash → game → score
  - pause/resume
  - quit back to menu
- Ensure the app loads quickly and works as a static site.

## Milestone 2 — Visual polish and mobile layout

### Goal
Make the UI match the Claude design with strong mobile polish, responsive spacing, and good UX for phones.

### Tasks
- Implement the dark UI shell, glassy board, and subtle glow around active buttons.
- Add smooth transitions for screen changes and button state changes.
- Improve button layout on mobile so the board is always 2×5 in portrait and centered in the viewport.
- Add a compact, readable HUD for mobile:
  - score
  - remaining time
  - color legend with red/yellow/purple labels and point values
- Add footer version label for deployed builds.
- Tune typography, card shadows, and background gradients.

## Milestone 3 — Gameplay mechanics and scoring rules

### Goal
Finish the Bop-a-Mole game rules and scoring so the UI feels fair and responsive.

### Tasks
- Implement the color-lit mechanics:
  - red/yellow = positive hit
  - purple = penalty hit
  - white = unlit default button
- Apply the scoring rules:
  - red/yellow hit = +1
  - purple hit = -4
  - accidental white hit = -2
  - forgive red/yellow-to-white accidental taps for 500ms
- Limit active lights to a few at a time and make purple rarer than red/yellow.
- Add game timing and end-of-round behavior.
- Persist high score in localStorage and surface it on the menu.

## Milestone 4 — UX behavior and accessibility

### Goal
Make Zozzo usable for mobile players and accessible to a broader audience.

### Tasks
- Add touch-friendly hit areas and prevent accidental misses.
- Add keyboard support for desktop play if possible.
- Add ARIA roles and live-updating announcements for score/time.
- Add focus-visible styling and ensure buttons are readable in both light and dark states.
- Add subtle haptics/sound feedback for hits, misses, and transitions.

## Milestone 5 — Deployment and production readiness

### Goal
Prepare the app for live hosting at `zanyaziz.com/zozzo` with a stable version and easy deploy process.

### Tasks
- Keep the repo up to date with semantic version markers (e.g. `v0.03`).
- Maintain a deployable public folder structure.
- Add a Node.js static server and/or GitHub Actions deploy pipeline.
- Verify subpath support at `/zozzo` and test URLs on staging.
- Document deploy/run commands in `README.md`.

## Milestone 6 — Post-launch improvements

### Goal
Extend the platform beyond the first playable UI by adding richer modes and polish.

### Tasks
- Add additional game modes or difficulty settings.
- Add a leaderboard/high-score board.
- Add sound/music and enhanced animation states.
- Add progressive web app metadata for installability.
- Add analytics/performance monitoring.

## Immediate next actions
- Finalize the Claude-based screen layouts and exact spacing for the menu/game/score screens.
- Test the current build on real mobile devices and fix any layout issues.
- Create a small release note for `v0.03` and tag the repository if desired.
