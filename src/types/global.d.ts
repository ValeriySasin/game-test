import { gsap as GsapType } from 'gsap';

declare global {
  interface Window {
    gsap: typeof GsapType;
    game: Phaser.Game;
  }
}

export {};
