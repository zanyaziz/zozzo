# Zozzo Project Plan

This project plan breaks the Zozzo UI/game build into tracked milestones and workstreams.

## Overview
The goal is to build the Claude-designed Zozzo game experience, ship a polished mobile-first Bop-a-Mole game, and deploy it at `zanyaziz.com/zozzo`.

## Milestones

### Milestone 1: Core playable experience
- [ ] Implement splash/menu screen with game selection and play CTA.
- [ ] Build the Bop-a-Mole game screen with score, timer, board, and controls.
- [ ] Add the post-game score screen with replay and home actions.
- [ ] Wire state transitions between splash, game, and score.
- [ ] Deploy a working static version and verify basic flow.

### Milestone 2: Claude UI fidelity
- [ ] Recreate the Claude design look and feel for the Zozzo app.
- [ ] Add dark glassy board styling, subtle glow, and soft gradients.
- [ ] Ensure the button board renders as a 2×5 mobile grid.
- [ ] Add mobile-friendly HUD spacing and the color legend.
- [ ] Add version marker visible in the deployed UI.

### Milestone 3: Gameplay rules and scoring
- [ ] Implement colored active button logic with red/yellow/purple states.
- [ ] Enforce scoring:
  - red/yellow hit = +1
  - purple hit = -4
  - white accidental hit = -2
- [ ] Add 500ms forgiveness after red/yellow light turns off.
- [ ] Limit active lit buttons to a few at a time.
- [ ] Persist best score locally.

### Milestone 4: Polish and mobile behavior
- [ ] Improve touch hit targets and reduce accidental misses.
- [ ] Add transitions and visual feedback for hits/misses.
- [ ] Add accessibility improvements (ARIA, keyboard support, live updates).
- [ ] Add sound/haptics feedback.
- [ ] Test the experience on iOS and Android mobile browsers.

### Milestone 5: Deployment and release
- [ ] Keep repo in sync with GitHub and tag releases.
- [ ] Add a deploy workflow or script for `zanyaziz.com/zozzo`.
- [ ] Verify path-based hosting and subpath support.
- [ ] Document deployment commands and version policy.

### Milestone 6: Future expansion
- [ ] Add additional game modes or difficulty settings.
- [ ] Add high-score board/leaderboard.
- [ ] Add PWA metadata for home-screen install.
- [ ] Add analytics or performance monitoring.

## Workstreams

### UI and Design
- Match the Claude screen layouts.
- Use consistent spacing, typography, and button states.
- Keep mobile layout adaptive and readable.

### Game Logic
- Keep the game engine simple and reliable.
- Keep scoring rules explicit and easy to adjust.
- Keep gameplay responsive and low-latency.

### Deployment
- Use `package.json` and `server.js` for node static serving.
- Use GitHub Actions or manual rsync deploy.
- Keep the deployed version visible in the UI.

### Quality
- Add small tests for game scoring and timer behavior.
- Check accessibility semantics.
- Run the app on real mobile devices.

## Current version
- `v0.05`
