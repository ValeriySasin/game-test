// Game dimensions
export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;

// Reel configuration
export const REEL_COUNT = 3;
export const SYMBOL_COUNT = 1; // 1 row
export const SYMBOL_SIZE = 200;
export const REEL_WIDTH = 220;
export const REEL_HEIGHT = 220;
export const REEL_SPACING = 30;

// Spin configuration
export const SPIN_DURATION_BASE = 1500; // ms
export const SPIN_STAGGER = 300;        // ms delay between reels stopping

// Symbol keys
export const SYMBOLS = ['gem', 'crown', 'coin', 'seven'] as const;
export type SymbolKey = typeof SYMBOLS[number];

// Scene keys
export const SCENES = {
  PRELOAD: 'PreloadScene',
  LOADING: 'LoadingScene',
  GAME: 'GameScene',
} as const;

// Asset keys
export const ASSETS = {
  // Images
  BG: 'background',
  REEL_FRAME: 'reel_frame',
  REEL_MASK: 'reel_mask',
  SYMBOL_GEM: 'symbol_gem',
  SYMBOL_CROWN: 'symbol_crown',
  SYMBOL_COIN: 'symbol_coin',
  SYMBOL_SEVEN: 'symbol_seven',
  BTN_SPIN: 'btn_spin',
  BTN_SOUND_ON: 'btn_sound_on',
  BTN_SOUND_OFF: 'btn_sound_off',
  LOGO: 'logo',
  WIN_BANNER: 'win_banner',
  PARTICLE: 'particle',

  // Audio
  SFX_WIN: 'sfx_win',
  SFX_SPIN: 'sfx_spin',
  SFX_STOP: 'sfx_stop',
  SFX_CLICK: 'sfx_click',
  MUSIC_BG: 'music_bg',

  // Spine — spineboy from Phaser labs CDN (Spine 3.8 format)
  SPINE_GOBLIN: 'spineboy',
} as const;

// Spine animation states (spineboy-pro.json animations)
export const SPINE_ANIMS = {
  IDLE:  'idle',
  WIN:   'jump',   // spineboy jumps on win
  SPIN:  'run',    // spineboy runs while reels spin
  IDLE2: 'walk',   // slow walk between spins
} as const;

// Paytable
export interface PaytableRow {
  symbols:    SymbolKey[];
  count:      2 | 3;
  multiplier: number;
  label:      string;
}

export const PAYTABLE: PaytableRow[] = [
  { symbols: ['seven'], count: 3, multiplier: 50, label: 'JACKPOT!' },
  { symbols: ['gem'],   count: 3, multiplier: 20, label: 'BIG WIN'  },
  { symbols: ['crown'], count: 3, multiplier: 15, label: 'WIN'      },
  { symbols: ['coin'],  count: 3, multiplier: 10, label: 'WIN'      },
  { symbols: ['seven'], count: 2, multiplier:  3, label: 'WIN'      },
];
