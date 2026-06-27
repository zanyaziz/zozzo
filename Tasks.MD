# Zozzo — Tasks & Milestones

Planned milestones and tasks for the Zozzo project.

1. Bare-minimum E2E
   - Create splash screen, Bop-a-Mole game, final score screen. (done)
   - Mobile-first responsive layout. (done)
   - Single-file deployable web app (`index.html`).

2. Polish & UX
   - Add sound effects and haptics for mobile.
   - Add animations for mole hits and transitions.
   - Add accessibility improvements (focus management, ARIA labels).

3. Features
   - Multiple difficulty levels and game modes.
   - Local high-score persistence (localStorage) and leaderboard.
   - Share score to social networks / deep links.

4. Build & Deploy
   - Add simple build step (minify) and CI deploy to zanyaziz.com/zozzo.
   - Configure subpath routing and test on staging.

5. Cross-platform wrappers
   - Package as a PWApp and add iOS/Android meta for home-screen install.
   - Optional Capacitor wrapper for native app stores.

6. Testing & Metrics
   - Add unit tests for game logic.
   - Add analytics and performance monitoring.

Next immediate steps:
- Test locally on mobile browsers and iterate on touch responsiveness.
- Add sound and vibration (optional) and quick A/B of spawn rates.
