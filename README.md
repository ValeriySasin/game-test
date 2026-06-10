# 🎰 Lucky Reels — HTML5 Slot Game

A fully-featured browser slot machine built with **Phaser 3**, **TypeScript**, **GSAP animations**, and a **Spine 3.8 animated character**. Runs entirely in the browser — no server required.

---

## ✨ Features

- **3 reels × 1 row** — classic one-row slot layout
- **4 symbol types** — Gem 💎, Crown 👑, Coin 🪙, Seven 7️⃣
- **Paytable with multipliers** — including 50× Jackpot for triple sevens
- **Spine 3.8 animated character** — idle / spin / win states driven by game events
- **Procedural background music** — ambient casino loop generated in real-time via Web Audio API (no MP3 files)
- **Sound effects** — click, spin, stop, win (also procedural)
- **Sound toggle** — mute/unmute everything with one button
- **Win banner + gold particle burst** on every win
- **Balance & bet display** — balance updates after each spin
- **Paytable modal** — tap the ℹ button to see all payouts
- **Preload scene** — animated loading screen with gradient progress bar
- **Docker support** — production-ready nginx container

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher ([download](https://nodejs.org))
- **npm** v9 or higher (comes with Node.js)

### 1. Clone the repository

```bash
git clone https://github.com/ValeriySasin/game-test.git
cd game-test
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm start
```

Open **http://localhost:8090** in your browser.

### 4. Build for production

```bash
npm run build
```

Output goes to `./dist/` — a self-contained static site ready to deploy anywhere (GitHub Pages, Netlify, S3, etc.).

---

## 🐳 Docker

```bash
docker build -t lucky-reels .
docker run -p 3000:80 lucky-reels
```

Open **http://localhost:3000**.

---

## 🎮 How to Play

1. The game opens with your balance set to **$1 000** and a bet of **$10**
2. Click **SPIN** to spin the reels
3. If 3 symbols match — you win! Balance increases by `bet × multiplier`
4. Click **ℹ** (top right) to view the full paytable
5. Click **🔊** to toggle sound on/off

### Paytable

| Combination | Multiplier |
|---|---|
| 7️⃣ 7️⃣ 7️⃣ | **×50** 🎰 JACKPOT |
| 💎 💎 💎 | ×20 BIG WIN |
| 👑 👑 👑 | ×15 WIN |
| 🪙 🪙 🪙 | ×10 WIN |
| 7️⃣ 7️⃣ — | ×3 WIN |

---

## 🗂️ Project Structure

```
game-test/
├── assets/
│   └── spine/
│       ├── spineboy.json    # Spine 3.8 skeleton data
│       ├── spineboy.atlas   # Texture atlas descriptor
│       └── spineboy.png     # Character sprite sheet
├── public/
│   └── index.html           # HTML entry point
├── src/
│   ├── main.ts              # Phaser game bootstrap + SpinePlugin setup
│   ├── scenes/
│   │   ├── PreloadScene.ts  # Loading screen — loads Spine assets, shows progress bar
│   │   └── GameScene.ts     # Main game scene — reels, UI, win logic, state
│   ├── components/
│   │   ├── reel/            # Reel spin animation + symbol strip logic
│   │   ├── spin-button/     # Animated SPIN button with hover/disabled states
│   │   ├── spine-character/ # Spine character wrapper (idle/spin/win + fallback)
│   │   └── sound-manager/   # Sound toggle + procedural audio calls
│   ├── api/
│   │   ├── http-client.ts   # fetch wrapper, throws HttpError on failure
│   │   ├── player.api.ts    # getProfile(), getSettings(), updateBalance()
│   │   ├── game.api.ts      # getConfig(), spin(), getHistory()
│   │   ├── mock/            # In-browser mock backend (dev only, not committed to prod)
│   │   └── types/           # ApiResponse, HttpError, player and game types
│   ├── utils/
│   │   ├── ProceduralSounds.ts  # Web Audio API — background music + SFX
│   │   ├── AssetGenerator.ts    # Draws symbol textures procedurally (no image files)
│   │   └── draw-helpers.ts      # Shared Graphics drawing utilities
│   ├── enums/               # Colors, fonts, animation durations, UI text, layout
│   └── types/
│       ├── constants.ts     # Game config, asset keys, win combinations + multipliers
│       ├── index.ts         # TypeScript interfaces
│       └── global.d.ts      # Window type augmentations (gsap, SpinePlugin)
├── eslint.config.mjs        # ESLint 9 flat config with TypeScript type-checked rules
├── Dockerfile               # Multi-stage build: Node build → nginx serve
├── webpack.config.js        # Webpack 5 dev + prod config
├── tsconfig.json            # TypeScript strict mode config
└── package.json
```

---

## 🛠️ Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [Phaser 3](https://phaser.io/) | 3.90 | HTML5 game framework (WebGL) |
| [SpinePlugin](https://phaser.io/news/2021/05/spine-plugin) | 3.8 | Spine skeletal animation in Phaser |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type-safe JavaScript (strict mode) |
| [GSAP](https://gsap.com/) | 3.x | Reel spin, win banner, UI animations |
| [Webpack 5](https://webpack.js.org/) | 5.x | Bundler with hot-reload dev server |
| [ESLint 9](https://eslint.org/) | 9.x | Linting with TypeScript type-checked rules |
| [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | native | Procedural background music + SFX |
| [Docker](https://docker.com/) | — | Multi-stage production container |

---

## ✏️ Common Customisations

| What to change | Where |
|---|---|
| Background colour | `src/main.ts` → `backgroundColor` |
| Game title text | `src/enums/ui-text.ts` |
| Bet values (min / max / steps) | `src/api/mock/game.mock.ts` → `betMin`, `betMax`, `betSteps` |
| Win combinations & multipliers | `src/types/constants.ts` → win table |
| Background music & SFX | `src/utils/ProceduralSounds.ts` |
| Symbol colours & shapes | `src/utils/AssetGenerator.ts` |

---

## 🏗️ Architecture Notes

### No external asset files (except Spine)
All symbol textures and UI graphics are **drawn programmatically** using Phaser's `Graphics` API. Zero image downloads required.

### Spine character with fallback
If the SpinePlugin fails to load, the game automatically falls back to a procedurally drawn animated character using GSAP tweens — always playable.

### Procedural audio
Background music and all SFX are synthesised at runtime using the Web Audio API. No MP3 files, works fully offline.

### Mock API
Spin results come from a lightweight in-browser mock (`src/api/mock/`) that simulates a real backend. Drop-in replaceable with a real HTTP endpoint — `http-client.ts`, `player.api.ts`, and `game.api.ts` are already wired up.

### Reel animation — two-phase symbol pre-load

Each reel uses three `Phaser.GameObjects.Image` instances (`image[0]`, `image[1]`, `image[2]`). During a spin they scroll downward by `SYMBOL_SIZE` (200 px) per step via a single GSAP tween on an `offset` value, with wrapping applied in `onUpdate`:

```
image[0]  y = -200 + raw   (off-screen top  →  center)
image[1]  y =        raw   (center          →  off-screen bottom)
image[2]              always off-screen (wraps behind the mask)
```

To guarantee that the target symbol is **never visibly swapped** when the reel stops, textures are loaded in two silent phases during the final steps:

| Phase | When | What changes |
|---|---|---|
| **A** | First frame of the penultimate step — `image[0]` ≈ 10 px visible at the top edge | `image[0]` → target texture |
| **B** | Last frame of the penultimate step — `image[1]` ≈ 10 px visible at the bottom edge | `image[1]`, `image[2]` → target & below textures; strip index advanced |

By the time `onComplete` fires, every image already carries the correct texture — no texture changes occur on a fully-visible symbol.

### Symbol texture dimensions and `setDisplaySize`

The procedurally baked textures have **different native dimensions**:

| Symbol | Native size |
|---|---|
| Gem | 200 × 200 px |
| Crown, Coin, Seven | 400 × 400 px |

`Phaser.GameObjects.Image.setTexture()` replaces the texture but **does not recalculate scale** — the previous `scaleX`/`scaleY` is kept. This means a Gem texture applied to an image that was previously showing a 400 × 400 symbol would appear at half size (100 × 100 px instead of 200 × 200 px).

**Rule:** every `setTexture()` call is always immediately followed by `setDisplaySize(SYMBOL_SIZE, SYMBOL_SIZE)` to force the correct display size regardless of the texture's native dimensions. This is enforced in `updateSymbolTextures()` and in both pre-load phases.

### Win animation lifecycle

`playWinAnimation()` creates a GSAP `timeline()` and stores the reference in `this.winTimeline`. Before starting a new win animation (or a new spin), the previous timeline is explicitly killed with `winTimeline.kill()`. This prevents a timeline that finished mid-animation from leaving the symbol at a non-baseline scale, which was the root cause of symbols appearing enlarged after consecutive wins.

---

## 🧑‍💻 Scripts

```bash
npm start          # Dev server at http://localhost:8090
npm run build      # Production build → ./dist
npm run lint       # ESLint check
npm run lint:fix   # ESLint auto-fix
npm run typecheck  # TypeScript check without building
```

---

## 📄 License

MIT — free to use, modify, and distribute.
