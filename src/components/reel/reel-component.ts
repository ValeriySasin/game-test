import Phaser from 'phaser';
import { gsap } from 'gsap';
import { ASSETS, SYMBOL_SIZE, SymbolKey } from '../../types/constants';
import { useReel, ReelLogic } from './use-reel';

const VISIBLE_SYMBOLS = 1;

export class ReelComponent {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private symbolImages: Phaser.GameObjects.Image[] = [];
  private logic: ReelLogic;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.logic = useReel();
    this.container = scene.add.container(x, y);
    this.buildVisuals();
  }

  private getAssetKey(symbol: SymbolKey): string {
    switch (symbol) {
      case 'gem':   return ASSETS.SYMBOL_GEM;
      case 'crown': return ASSETS.SYMBOL_CROWN;
      case 'coin':  return ASSETS.SYMBOL_COIN;
      case 'seven': return ASSETS.SYMBOL_SEVEN;
    }
  }

  private buildVisuals(): void {
    const count = VISIBLE_SYMBOLS + 2;
    const strip = this.logic.getStrip();
    const idx = this.logic.getCurrentIndex();

    for (let i = 0; i < count; i++) {
      const symKey = strip[(idx + i) % strip.length];
      const img = this.scene.add.image(0, (i - 1) * SYMBOL_SIZE, this.getAssetKey(symKey));
      img.setDisplaySize(SYMBOL_SIZE, SYMBOL_SIZE);
      this.container.add(img);
      this.symbolImages.push(img);
    }
  }

  private updateSymbolTextures(): void {
    const strip = this.logic.getStrip();
    const idx = this.logic.getCurrentIndex();
    for (let i = 0; i < this.symbolImages.length; i++) {
      const symKey = strip[(idx + i) % strip.length];
      this.symbolImages[i].setTexture(this.getAssetKey(symKey));
    }
  }

  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  spin(targetSymbol: SymbolKey, delay: number): Promise<void> {
    return new Promise(resolve => {
      const landIndex = this.logic.getLandIndex();
      // After setCurrentIndex(landIndex) the CENTER slot is strip[landIndex+1],
      // so write the target symbol there.
      const centerIndex = (landIndex + 1) % this.logic.getStripCount();
      this.logic.setSymbolAt(centerIndex, targetSymbol);

      const strip = this.logic.getStrip();
      const stripCount = this.logic.getStripCount();
      const totalSymbols = stripCount * 2 + (stripCount - 1);
      const totalDistance = totalSymbols * SYMBOL_SIZE;

      const obj = { offset: 0 };

      gsap.to(obj, {
        offset: totalDistance,
        duration: 1.6,
        delay: delay / 1000,
        ease: 'power2.inOut',
        onUpdate: () => {
          const raw = obj.offset % SYMBOL_SIZE;
          const stepsMoved = Math.floor(obj.offset / SYMBOL_SIZE);

          for (let i = 0; i < this.symbolImages.length; i++) {
            let posY = (i - 1) * SYMBOL_SIZE + raw;
            const wrapThreshold = SYMBOL_SIZE * (VISIBLE_SYMBOLS + 0.5);
            if (posY > wrapThreshold) posY -= SYMBOL_SIZE * (VISIBLE_SYMBOLS + 2);
            this.symbolImages[i].y = posY;
          }

          const newIndex = (this.logic.getCurrentIndex() + stepsMoved) % strip.length;
          if (newIndex !== this.logic.getCurrentIndex()) {
            this.logic.setCurrentIndex(newIndex);
            this.updateSymbolTextures();
          }
        },
        onComplete: () => {
          // Kill any in-progress win animation on all symbol images
          gsap.killTweensOf(this.symbolImages);
          this.logic.setCurrentIndex(landIndex);
          this.updateSymbolTextures();
          // Reset every image to exact position + neutral transform
          for (const img of this.symbolImages) {
            img.setDisplaySize(SYMBOL_SIZE, SYMBOL_SIZE);
            img.setAngle(0);
          }
          this.symbolImages[0].y = -SYMBOL_SIZE;
          this.symbolImages[1].y = 0;
          this.symbolImages[2].y =  SYMBOL_SIZE;
          resolve();
        },
      });
    });
  }

  getCurrentSymbol(): SymbolKey {
    return this.logic.getCurrentSymbol();
  }

  playWinAnimation(): void {
    const symbol = this.symbolImages[1];
    // Use current display scale as the "natural" baseline so 400×400 textures
    // displayed at 200×200 (scaleX=0.5) don't get reset to wrong size.
    const sx = symbol.scaleX;
    const sy = symbol.scaleY;
    gsap.timeline()
      .to(symbol, { scaleX: sx * 1.3, scaleY: sy * 1.3, duration: 0.15, ease: 'power2.out' })
      .to(symbol, { scaleX: sx * 0.9, scaleY: sy * 0.9, duration: 0.1 })
      .to(symbol, { scaleX: sx * 1.2, scaleY: sy * 1.2, duration: 0.1 })
      .to(symbol, { scaleX: sx,       scaleY: sy,       duration: 0.15 })
      .to(symbol, { angle: -10, duration: 0.08 })
      .to(symbol, { angle:  10, duration: 0.08 })
      .to(symbol, { angle: -10, duration: 0.08 })
      .to(symbol, { angle:   0, duration: 0.08 });
  }

  destroy(): void {
    this.container.destroy();
  }
}
