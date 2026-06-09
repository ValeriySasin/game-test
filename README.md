# 🎰 Lucky Reels — HTML5 Slot Game

A fully-featured browser slot machine built with **Phaser 3**, **TypeScript**, **GSAP animations**, and a **Spine 3.8 animated character**. Runs entirely in the browser — no server required for gameplay.

---

## 📸 Preview

| Preload Screen | Main Game | Win State |
|---|---|---|
| Animated star field + gradient progress bar | 3 reels, Spine character, sound toggle | Win banner + gold particles + character jump |

---

## ✨ Features

- **3 reels × 1 row** — classic one-row slot layout
- **4 symbol types** — Gem 💎, Crown 👑, Coin 🪙, Seven 7️⃣
- **Paytable with multipliers** — including 50× Jackpot for triple sevens
- **Spine 3.8 animated character** — idle / run / jump states driven by game events
- **Procedural background music** — ambient loop generated in real-time via Web Audio API (no MP3 files needed)
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
git clone https://github.com/ValeriySasin/test-game.git
cd test-game
```

### 2. Install dependencies

```bash
npm install
```

> This may take a minute — it downloads Phaser, GSAP, TypeScript, Webpack, and the SpinePlugin.

### 3. Start the development server

```bash
npm start
```

Open **http://localhost:8090** in your browser. The game loads immediately.

### 4. Build for production

```bash
npm run build
```

Output goes to `./dist/`. The folder contains a self-contained static site ready to deploy anywhere (GitHub Pages, Netlify, S3, etc.).

---

## 🐳 Docker

Build and run a production nginx container with one command:

```bash
docker build -t lucky-reels .
docker run -p 3000:80 lucky-reels
```

Open **http://localhost:3000**.

---

## 🎮 How to Play

1. The game opens with your balance set to **$1 000** and a bet of **$10**
2. Click **SPIN** to spin the reels
3. If all 3 symbols match — you win! Your balance increases by `bet × multiplier`
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
test-game/
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
│   │   └── GameScene.ts     # Main game scene — reels, UI, win logic
│   ├── components/
│   │   ├── reel/            # Reel spin animation + symbol strip logic
│   │   ├── spin-button/     # Animated SPIN button with hover/disabled states
│   │   ├── spine-character/ # Spine character wrapper (idle/spin/win + fallback)
│   │   └── sound-manager/   # Sound toggle + procedural audio calls
│   ├── utils/
│   │   ├── ProceduralSounds.ts  # Web Audio API — background music + SFX
│   │   ├── AssetGenerator.ts    # Draws symbol textures procedurally (no image files)
│   │   └── draw-helpers.ts      # Shared Graphics drawing utilities
│   ├── api/                 # Mock spin API (simulates a real backend)
│   ├── enums/               # Shared enums: colors, fonts, animation, UI text
│   └── types/
│       ├── constants.ts     # Game config, asset keys, paytable
│       ├── index.ts         # TypeScript interfaces
│       └── global.d.ts      # Window type augmentations (gsap, SpinePlugin)
├── Dockerfile               # Multi-stage build: Node build → nginx serve
├── webpack.config.js        # Webpack 5 dev + prod config
├── tsconfig.json            # TypeScript strict mode config
└── package.json
```

---

## 🛠️ Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [Phaser 3](https://phaser.io/) | 3.x | HTML5 game framework |
| [SpinePlugin](https://phaser.io/news/2021/05/spine-plugin) | 3.8 | Spine skeletal animation in Phaser |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type-safe JavaScript (strict mode) |
| [GSAP](https://gsap.com/) | 3.x | Reel spin, win banner, UI animations |
| [Webpack 5](https://webpack.js.org/) | 5.x | Bundler with hot-reload dev server |
| [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | native | Procedural background music + SFX |
| [Docker](https://docker.com/) | — | Multi-stage production container |

---

## 🏗️ Architecture Notes

### No external asset files (except Spine)
All symbol textures and UI graphics are **drawn programmatically** using Phaser's `Graphics` API. This means the game works out-of-the-box with zero image downloads.

### Spine character with fallback
If the SpinePlugin fails to load (e.g. unsupported browser), the game automatically falls back to a procedurally drawn animated character using GSAP tweens — the game is always playable.

### Procedural audio
Background music and all SFX are synthesised at runtime using the Web Audio API. No MP3 files are needed and the game works fully offline.

### Mock API
Spin results come from a lightweight mock server (`src/api/mock/`) that runs in-browser. It simulates network delay and returns randomised results — drop-in replaceable with a real HTTP endpoint.

---

## 🧑‍💻 Development Tips

### TypeScript type check (without building)
```bash
npx tsc --noEmit
```

### Check bundle size
```bash
npm run build
du -sh dist/
```

### Open in VS Code / WebStorm
Just open the project folder — both editors auto-detect `tsconfig.json` and `package.json`.

---

## 📄 License

MIT — free to use, modify, and distribute.
