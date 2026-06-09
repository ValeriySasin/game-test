import Phaser from 'phaser';
import { gsap } from 'gsap';
import { PreloadScene } from './scenes/PreloadScene';
import { GameScene } from './scenes/GameScene';
import { GAME_WIDTH, GAME_HEIGHT } from './types/constants';

window.gsap = gsap;

// SpinePlugin sets window.SpinePlugin when its IIFE runs.
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('phaser/plugins/spine/dist/SpinePlugin.min.js');
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
const SpinePlugin = (window as any).SpinePlugin;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a0a2e',
  parent: 'game-container',
  scene: [PreloadScene, GameScene],
  plugins: SpinePlugin ? {
    scene: [
      {
        key: 'SpinePlugin',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        plugin: SpinePlugin,
        mapping: 'spine',
      },
    ],
  } : undefined,
  render: {
    antialias: true,
    pixelArt: false,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  audio: {
    // We use ProceduralSounds (Web Audio API) directly,
    // so Phaser's own WebAudio context is not needed.
    disableWebAudio: true,
    noAudio: true,
  },
  input: {
    activePointers: 3,
  },
};

const game = new Phaser.Game(config);

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (window as any).game = game;
}
