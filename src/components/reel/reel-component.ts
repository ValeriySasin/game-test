import Phaser from 'phaser';
import { gsap } from 'gsap';
import { SYMBOL_ASSET_MAP, SYMBOL_SIZE, SymbolKey } from '@/types/constants';
import { useReel, ReelLogic } from './use-reel';

const VISIBLE_SYMBOLS = 1;

export class ReelComponent {
  private readonly container: Phaser.GameObjects.Container;
  private readonly symbolImages: Phaser.GameObjects.Image[] = [];
  private readonly logic: ReelLogic;
  /** Reference to the running win animation so it can be killed cleanly. */
  private winTimeline: gsap.core.Timeline | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.logic = useReel();
    this.container = scene.add.container(x, y);
    this.buildVisuals(scene);
  }

  private buildVisuals(scene: Phaser.Scene): void {
    const count = VISIBLE_SYMBOLS + 2;
    const strip = this.logic.getStrip();
    const idx = this.logic.getCurrentIndex();

    for (let i = 0; i < count; i++) {
      const symKey = strip[(idx + i) % strip.length];
      const img = scene.add.image(0, (i - 1) * SYMBOL_SIZE, SYMBOL_ASSET_MAP[symKey]);
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
      this.symbolImages[i].setTexture(SYMBOL_ASSET_MAP[symKey]);
      // Must call setDisplaySize after setTexture: textures have different native
      // dimensions (GEM=200×200, others=400×400) so the scale must be recalculated
      // each time the texture changes, otherwise the wrong scale is inherited.
      this.symbolImages[i].setDisplaySize(SYMBOL_SIZE, SYMBOL_SIZE);
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
      // totalSymbols = 3 * stripCount - 1 (exactly 3 full laps minus one step).
      // 3 laps is a multiple of stripCount, so (currentIndex + totalSymbols) % stripCount
      // === (currentIndex - 1) % stripCount === landIndex — guaranteed landing position.
      // Three laps gives enough visual spin duration; adjust the multiplier to taste.
      const totalSymbols = stripCount * 2 + (stripCount - 1);
      const totalDistance = totalSymbols * SYMBOL_SIZE;

      const obj = { offset: 0 };
      // Pre-compute final texture keys once — used in both pre-load phases and onComplete.
      const targetTex = SYMBOL_ASSET_MAP[strip[(landIndex + 1) % strip.length]]; // center (landing)
      const belowTex  = SYMBOL_ASSET_MAP[strip[(landIndex + 2) % strip.length]]; // slot below center
      // Two-phase texture pre-load flags (fire exactly once each per spin).
      let phaseADone = false; // image[0] → target texture
      let phaseBDone = false; // image[1] + image[2] → final textures, index advanced

      gsap.to(obj, {
        offset: totalDistance,
        duration: 1.6,
        delay: delay / 1000,
        ease: 'power2.inOut',
        onUpdate: () => {
          const raw         = obj.offset % SYMBOL_SIZE;
          const stepsMoved  = Math.floor(obj.offset / SYMBOL_SIZE);
          const wrapThreshold = SYMBOL_SIZE * (VISIBLE_SYMBOLS + 0.5);

          for (let i = 0; i < this.symbolImages.length; i++) {
            let posY = (i - 1) * SYMBOL_SIZE + raw;
            if (posY > wrapThreshold) posY -= SYMBOL_SIZE * (VISIBLE_SYMBOLS + 2);
            this.symbolImages[i].y = posY;
          }

          // Each animation "step" (one full SYMBOL_SIZE scroll):
          //   image[0].y = -SYMBOL_SIZE + raw  →  travels −200 → 0  (enters top→center)
          //   image[1].y =               raw   →  travels  0  → 200 (exits  center→bottom)
          //   image[2]   always off-screen (wraps behind the mask)
          //
          // Phase A — first frame of the penultimate step (totalSymbols-2).
          //   image[0] just wrapped off-screen top (y ≈ -190, ≈10 px visible).
          //   Guard: only swap when image[0] is still in the top half of the mask
          //   (y < -SYMBOL_SIZE/2) so the update is imperceptible even if GSAP skips
          //   a step on a slow/throttled device.
          if (!phaseADone && stepsMoved >= totalSymbols - 2) {
            const img0y = -SYMBOL_SIZE + raw; // image[0] current position
            if (img0y < -SYMBOL_SIZE * 0.5) { // still in off-screen / top-edge zone
              phaseADone = true;
              this.symbolImages[0].setTexture(targetTex);
              this.symbolImages[0].setDisplaySize(SYMBOL_SIZE, SYMBOL_SIZE);
            }
          }

          // Phase B — image[1] has nearly exited the bottom in the penultimate step
          //   (raw > 95 %, y ≈ 190, ≈10 px visible at bottom edge).
          //   After the next step-wrap image[1] re-appears at y = 0 (center) already
          //   carrying the target texture, so onComplete never swaps a visible image.
          //   Safety fallback: if the penultimate step is somehow skipped, fire on the
          //   first frame of the last step instead (image[1] at y≈0 is briefly visible,
          //   but better than the old snap-on-stop behaviour).
          if (!phaseBDone) {
            const inPenultimate = stepsMoved === totalSymbols - 2 && raw > SYMBOL_SIZE * 0.95;
            const fallback      = stepsMoved >= totalSymbols - 1;
            if (inPenultimate || fallback) {
              phaseBDone = true;
              this.symbolImages[1].setTexture(targetTex);
              this.symbolImages[1].setDisplaySize(SYMBOL_SIZE, SYMBOL_SIZE);
              this.symbolImages[2].setTexture(belowTex);
              this.symbolImages[2].setDisplaySize(SYMBOL_SIZE, SYMBOL_SIZE);
              this.logic.setCurrentIndex(landIndex);
            }
          }
        },
        onComplete: () => {
          // Kill any in-progress win animation (timeline + individual tweens)
          this.winTimeline?.kill();
          this.winTimeline = null;
          gsap.killTweensOf(this.symbolImages);
          // Move image[0] off-screen BEFORE any texture/size changes.
          // At the last onUpdate frame image[0] sits at y ≈ 0 (centered).
          // Snapping it off-screen first prevents a visible texture change
          // on a fully-visible image.
          this.symbolImages[0].y = -SYMBOL_SIZE;
          this.symbolImages[1].y = 0;
          this.symbolImages[2].y =  SYMBOL_SIZE;
          for (const img of this.symbolImages) { img.setAngle(0); }
          this.logic.setCurrentIndex(landIndex);
          // updateSymbolTextures calls setDisplaySize after each setTexture,
          // so scale is always correct regardless of texture native dimensions.
          this.updateSymbolTextures();
          resolve();
        },
      });
    });
  }

  getCurrentSymbol(): SymbolKey {
    return this.logic.getCurrentSymbol();
  }

  playWinAnimation(): void {
    // Kill any previous win animation before starting a new one so the
    // baseline scale is always captured from the reset state (setDisplaySize
    // in onComplete guarantees this).
    this.winTimeline?.kill();
    this.winTimeline = null;

    const symbol = this.symbolImages[1];
    // Use current display scale as the "natural" baseline so 400×400 textures
    // displayed at 200×200 (scaleX=0.5) don't get reset to wrong size.
    const sx = symbol.scaleX;
    const sy = symbol.scaleY;
    this.winTimeline = gsap.timeline({
      onComplete: () => { this.winTimeline = null; },
    })
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
    this.winTimeline?.kill();
    this.winTimeline = null;
    gsap.killTweensOf(this.symbolImages);
    this.container.destroy();
  }
}
