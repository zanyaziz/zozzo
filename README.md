# Handoff: Zozzo Web Emulator — Playroom Pop screens

## Overview
Zozzo is a web emulator of a screen-free, 10-button light-up tablet for kids (ages 1–12+). This package contains the **Playroom Pop** visual direction for every screen of the MVP: game-selection menu, boot/splash, and three games (Bop-A-Mole, Memory, Music Maker) plus the post-game state, in both mobile and desktop layouts.

## About the design files
The files here are **design references**, not production code to ship as-is. They show the intended look, layout, and behavior. Recreate them in your target stack (the master spec calls for **Node/Express static server + vanilla ES6 JS + semantic HTML5 + CSS3**). Build the real game logic, audio engine, and state router per the master spec; use these visuals as the pixel target.

### Files in this bundle
- `zozzo-playroom-pop-screens.html` — self-contained gallery of all screens (open in a **served** folder, not file://, so the device sub-component loads). Hosts cleanly on any static server.
- `ZozzoDevice.dc.html` — the 10-button device component the gallery loads at runtime. Must stay in the same folder as the HTML when serving.
- This README.

## Fidelity
**High-fidelity.** Colors, type, spacing, glow, and geometry are final. Recreate pixel-for-pixel.

## Design system / tokens

**Type**
- Display / headings: **Fredoka** (Google Fonts), weights 600–700.
- Body / UI: **Nunito** (Google Fonts), weights 600–800.
- Mono labels (optional dev chrome): **DM Mono**.

**Brand & surface colors**
- Playroom Pop background (menu/splash): `#4C6FE8` (periwinkle blue)
- Decorative blobs: coral `#FF6B4A`, sun yellow `#FFC83D`
- Cards: white `#FFFFFF`, radius 20–26px, shadow `0 16px 30px -16px rgba(20,20,60,.5)`
- Card text: title `#26263A`, subtext `#8A8AA0` / `#9A9AB0`
- Gameplay stage backgrounds (dark): `#1C2440` (Bop-A-Mole, Memory), `#241A40` (Music Maker), win/post-game `#10331E`

**The 10 LED button colors** (row-major: top row L→R, then bottom row L→R)
1. Magenta `#FF2D9B`  2. White `#F2F2F2`  3. Orange `#FF8A00`  4. Green `#21C24A`  5. Blue `#2E7BFF`
6. Cyan `#12C9D6`  7. Yellow `#FFC400`  8. Lime `#7BD636`  9. Red `#FF3B3B`  10. Purple `#9B45FF`

**Per-game accent**
- Bop-A-Mole `#FF6B4A` · Memory `#4D9BFF` · Music Maker `#9B45FF`

## The Zozzo device component (most important piece)
A horizontal white squircle with a colored rim holding **10 glossy candy buttons in a 5-col × 2-row grid** (matches the real Boppo/Zozzo hardware). Reusable, driven by props:
- `palette` — 10 hex colors (defaults above)
- `states` — array of 10 (1 = lit, 0 = unlit)
- `orientation` — `landscape` (5×2, default) or `portrait` (2×5)
- `theme` — `light` (white body) or `dark` (`#23263b→#161827` body, for gameplay)
- `rim` — rim color (menu `#8E0B81`, dark stages `#2b2050`)
- `glow` — 0–1.6 glow intensity
- `animate` — `rainbow` makes lit buttons pulse (menu/splash)

**Button rendering** (per button):
- Lit: `radial-gradient(circle at 36% 28%, #fff~.87, <color> 46%, <color darkened 26%> 100%)`, glow `box-shadow: 0 0 20px 5px <color@.85>, 0 0 48px 10px <color@.45>`, inset highlight + bottom shadow. Optional `zozzoPulse` animation with `0.16s * index` stagger.
- Unlit (light theme): pale tint `radial-gradient(circle at 36% 28%, #fff, <color@.28> 64%, <color@.42>)`, soft inset shadow, no glow.
- Unlit (dark theme): `<color@.16>` tint on dark, subtle inset.
- Each button is a circle, `width:92%` of a 1:1 grid cell, `border-radius:50%`.

The exact algorithm lives in `ZozzoDevice.dc.html` — read it for the precise gradient/shade math.

## Screens

### 1. Game Selection — Menu (`STATE_MENU`) — desktop & phone
- Background `#4C6FE8` with coral + yellow blobs and a soft top radial highlight.
- Header: white rounded-square logo mark + "Zozzo" wordmark (Fredoka 700); right side a high-score pill (`1,240`) and a small sound/EQ glyph.
- Centre: label "CHOOSE AN ACTIVITY" (uppercase, letter-spaced) above the device, which **pulses a revolving rainbow** (`states` all 1, `animate:rainbow`), gently floating (`floatY` 5s).
- Three game cards (desktop: 3-col grid at bottom; phone: stacked rows): icon chip + title (Fredoka) + one-line subtitle + high-score/level/free-play tag in the game accent color.
  - Bop-A-Mole icon: concentric ring target. Memory icon: 2×2 colored dots. Music Maker icon: 4 equalizer bars.
- Tapping a card → `audioEngine.play('menu_select')`, flash LEDs white, go to `STATE_PLAYING`.

### 2. Boot / Splash — phone
- Same Playroom Pop background. Logo + "Zozzo" + tagline "Play for hands-on minds".
- Device pulses rainbow.
- **Interactive (shown working in the prototype):** swipe left/right cycles the selected game (name, accent, dots, and the "Play <game>" button update); the 3 dots are a carousel indicator. Tapping **Play <game>** launches that game (splash swaps to the dark portrait gameplay view with a back arrow).

### 3. Gameplay (`STATE_PLAYING`)
Minimalist HUD over the device.
- **Top-left:** back/quit (×) + game name. **Top-right:** live score (Fredoka, in accent color).
- On **mobile the board rotates to PORTRAIT (2×5)** to maximize touch-target area; on **desktop it stays landscape (5×2)** with flanking stat panels.
- **Bop-A-Mole:** 1–2 buttons lit ("moles"); SPEED bar; combo ×N and lives dots (desktop); hint "Bop the lit buttons before they fade!".
- **Memory (Simon):** one button lit during playback; "Watch closely…" status pill; round counter; a row of sequence progress pills (filled = done).
- **Music Maker (free play):** segmented mode selector (Drums / Piano / DJ), record dot, a few buttons lit, an equalizer/waveform strip; no score. Hint "Tap any button to jam".

### 4. Post-Game (`STATE_POST_GAME`)
- Device behind shows a **green cascade** (all buttons green, pulsing) for a new high score — use an **amber** palette for a standard finish.
- Centered white modal: "NEW HIGH SCORE" badge, headline, big final score (Fredoka, green `#21C24A`), previous-best delta, **Play again** (filled green) and **Back to menu** (grey) buttons.

## Interactions & behavior
- Inputs: capture `touchstart` + `mousedown`; route to active game's `handleInput(buttonId)`.
- Audio: Web Audio API for zero-latency button sounds (preload/decode buffers; play on tap).
- Transitions: gentle float on idle device (`floatY`), `zozzoPulse` on lit buttons (2.4s, staggered).
- State router: `STATE_MENU` ⇄ `STATE_PLAYING` → `STATE_POST_GAME` → menu/replay.

## State / storage
- Global state object holds: current state, active game, score, sequence (Memory), speed/lives (Bop-A-Mole), selected mode (Music Maker), selected splash game.
- High scores per game in `localStorage`.

## Target architecture (from master spec, rename Boppo→Zozzo)
```
zozzo-emulator/
  public/
    index.html
    css/ base.css, hardware.css   # button geometry + LED glow
    js/  app.js (router+state), hardware.js (LED DOM), audio.js (Web Audio)
         games/ bop-a-mole.js, memory.js, music-maker.js
    assets/sounds/
  server.js   # Express static
  package.json
```
Map the device component above onto `hardware.css` + `hardware.js`; map the HUD/screens onto the per-state DOM that `app.js` shows/hides.

## Hosting (zanyaziz.com/zozzo)
Serve the built app at the `/zozzo` path. This gallery itself can also be hosted as a portfolio "designs" page — just keep `ZozzoDevice.dc.html` next to the HTML.

## Quick run (local)
You can preview the minimal playable Bop-a-Mole app either via a static server or with the included Node.js server.

Static server:
```bash
# macOS / Linux
python3 -m http.server 8000
# then open http://localhost:8000/index.html
```

Node.js server (recommended for matching deployment path `/zozzo`):
```bash
npm install
npm start
# then open http://localhost:3000/zozzo/index.html
```

The app is mobile-first and optimized for touch; open the same URL on a phone on your local network to test.

## Deploy
Build and copy the contents of this folder to the `zanyaziz.com/zozzo` path on your hosting server (or configure your webserver to serve this folder at `/zozzo`). If you prefer to use the included Node server, ensure `node` is available and run it behind a reverse proxy to serve `/zozzo` in production.

## Project plan
For roadmap, milestones, and tracked work, see [ProjectPlan.md](ProjectPlan.md).

---

Version: 0.03
