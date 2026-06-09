# 🎰 Lucky Reels — HTML5 Slot Game

A fully-featured HTML5 slot machine game built with **Phaser 3**, **TypeScript**, **GSAP**, and **Webpack**.

---

## ✨ Features

| Feature | Details |
|---|---|
| 3 Reels × 1 Row | Classic 3-symbol slot layout |
| 3 Symbols | Gem 💎 · Crown 👑 · Coin 🪙 |
| Mock Server | Randomised spin results with 25% win chance |
| Win Detection | All 3 matching symbols = win |
| GSAP Animations | Reel spin, win banner, balance flash |
| Spine Character | Goblin reacts to win/lose/idle states |
| Sound Manager | Background music + SFX, toggle on/off |
| Particle Effects | Gold particles burst on win |
| Procedural Art | Runs without external assets (textures generated in-code) |
| TypeScript | Strict mode, full type coverage |
| Docker | Production container via nginx |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ and **npm** v9+
- (Optional) **Docker** for containerised build

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/slot-game.git
cd slot-game
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the dev server
```bash
npm start
```
Open **http://localhost:8080** in your browser. Hot-reload is enabled.

### 4. Production build
```bash
npm run build
# Output goes to ./dist/
```

---

## 🎨 Adding Real Assets

The game ships with **procedurally generated placeholder art** so it works out-of-the-box. Replace with real assets:

### Audio
Place `.mp3` files in `assets/audio/`:
| File | Purpose |
|---|---|
| `bg_music.mp3` | Looping background music |
| `spin.mp3` | Reel spinning sound |
| `stop.mp3` | Reel stop click |
| `win.mp3` | Win fanfare |
| `click.mp3` | Button click |

Free sources: [freesound.org](https://freesound.org) · [opengameart.org](https://opengameart.org)

### Spine Animation (Goblin)
Download from the [Phaser 3 Spine Example repo](https://github.com/yandeu/phaser3-spine-example/tree/master/assets/spine) and place in `assets/spine/`:
```
assets/spine/goblin.json
assets/spine/goblin.atlas
assets/spine/goblin.png
```

The game falls back to a simple animated rectangle if Spine files are not present.

---

## 🐳 Docker

```bash
# Build the image
docker build -t slot-game .

# Run on port 3000
docker run -p 3000:80 slot-game
```
Open **http://localhost:3000**

---

## 🗂️ Project Structure

```
slot-game/
├── src/
│   ├── main.ts                  # Phaser game bootstrap
│   ├── scenes/
│   │   ├── PreloadScene.ts      # Loading screen with progress bar
│   │   └── GameScene.ts         # Main gameplay scene
│   ├── components/
│   │   ├── Reel.ts              # Individual reel with GSAP spin
│   │   ├── SpinButton.ts        # Animated spin button
│   │   ├── SpineCharacter.ts    # Spine animation wrapper
│   │   └── SoundManager.ts      # Audio control
│   ├── server/
│   │   └── MockServer.ts        # Fake spin API with random results
│   ├── utils/
│   │   └── AssetGenerator.ts   # Procedural texture generation
│   └── types/
│       ├── constants.ts         # Game config, keys, enums
│       ├── index.ts             # TypeScript interfaces
│       └── global.d.ts          # Window augmentations
├── assets/
│   ├── audio/                   # Place MP3 files here
│   └── spine/                   # Place Spine files here
├── public/
│   └── index.html
├── webpack.config.js
├── tsconfig.json
├── Dockerfile
└── package.json
```

---

## 🛠️ Tech Stack

- [Phaser 3](https://phaser.io/) — HTML5 game framework
- [TypeScript](https://www.typescriptlang.org/) — typed JavaScript
- [GSAP](https://gsap.com/) — professional animation library
- [Webpack 5](https://webpack.js.org/) — module bundler
- [Docker](https://docker.com/) — containerisation

---

## 📖 Opening in PhpStorm / WebStorm

1. **File → Open** → select the `slot-game/` folder
2. PhpStorm will detect `package.json` automatically
3. Open the **npm** tool window (View → Tool Windows → npm)
4. Double-click `start` to launch the dev server
5. The browser opens at **http://localhost:8080**

Alternatively use the built-in terminal:
```bash
npm start
```

---

## ⏱️ Development Time
~ 6–8 hours for a full implementation with real assets and Spine integration.
