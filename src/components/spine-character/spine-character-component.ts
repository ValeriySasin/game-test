import Phaser from 'phaser';
import { gsap } from 'gsap';
import { ASSETS, SPINE_ANIMS } from '../../types/constants';

/**
 * SpineboyCharacter — wraps the real Spine 3.8 "spineboy-pro" skeleton.
 *
 * Animations used:
 *   idle  → standing still between spins
 *   run   → while reels are spinning
 *   jump  → win celebration
 *   walk  → return-to-idle after win
 *
 * Falls back to a procedural animated rectangle if SpinePlugin is unavailable
 * (e.g. in Canvas mode or when spine assets fail to load).
 */
export class SpineCharacterComponent {
  private scene:    Phaser.Scene;
  private spineObj: any;                      // Spine game object (SpinePlugin type)
  private fallback: Phaser.GameObjects.Container | null = null;

  private x: number;
  private y: number;
  private currentAnim = '';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.x     = x;
    this.y     = y;
    this.init();
  }

  // ── Init ──────────────────────────────────────────────────────────────

  private init(): void {
    try {
      const s = this.scene as any;

      // SpinePlugin adds .spine() to scene.add — check it is actually a function
      if (typeof s.add?.spine !== 'function') {
        this.useFallback();
        return;
      }

      // Create spine game object: add.spine(x, y, key, animName, loop)
      this.spineObj = s.add.spine(this.x, this.y, ASSETS.SPINE_GOBLIN, SPINE_ANIMS.IDLE, true);
      this.spineObj.setScale(0.35);

      // Flip horizontally so spineboy faces the reels (right side of screen)
      this.spineObj.scaleX = -0.35;

      this.currentAnim = SPINE_ANIMS.IDLE;

    } catch (e) {
      console.warn('[SpineCharacterComponent] Spine init failed, using fallback:', e);
      this.useFallback();
    }
  }

  // ── Public API ────────────────────────────────────────────────────────

  /** Called when reels start spinning */
  onSpin(): void {
    this.play(SPINE_ANIMS.SPIN, true);
  }

  /** Called when a win is detected (after reels stop) */
  onWin(): void {
    // Jump once, then return to idle
    this.play(SPINE_ANIMS.WIN, false);

    // Schedule return to idle after the jump animation (~1.1 s)
    this.scene.time.delayedCall(1100, () => {
      if (this.currentAnim === SPINE_ANIMS.WIN) {
        this.play(SPINE_ANIMS.IDLE, true);
      }
    });
  }

  /** Called after a non-winning spin */
  onIdle(): void {
    this.play(SPINE_ANIMS.IDLE, true);
  }

  // ── Internal helpers ──────────────────────────────────────────────────

  private play(anim: string, loop: boolean): void {
    if (this.spineObj) {
      try {
        this.currentAnim = anim;
        this.spineObj.play(anim, loop, true);
      } catch (e) {
        console.warn(`[SpineCharacterComponent] Cannot play anim "${anim}":`, e);
      }
      return;
    }

    // Fallback: simple scale pulse to indicate state change
    if (this.fallback) {
      gsap.fromTo(
        this.fallback,
        { scaleX: 1.2, scaleY: 1.2 },
        { scaleX: 1,   scaleY: 1,   duration: 0.3, ease: 'back.out' },
      );
    }
  }

  // ── Fallback character ────────────────────────────────────────────────

  private useFallback(): void {
    this.fallback = this.scene.add.container(this.x, this.y);

    const g = this.scene.add.graphics();
    // Body
    g.fillStyle(0x44cc44, 1);
    g.fillRoundedRect(-20, -60, 40, 70, 10);
    // Head
    g.fillCircle(0, -80, 22);
    // Eyes
    g.fillStyle(0xffffff, 1);
    g.fillCircle(-8, -84, 6);
    g.fillCircle(8, -84, 6);
    g.fillStyle(0x000000, 1);
    g.fillCircle(-8, -84, 3);
    g.fillCircle(8, -84, 3);
    // Hat
    g.fillStyle(0xcc2200, 1);
    g.fillTriangle(-14, -102, 14, -102, 0, -130);
    g.fillStyle(0xffcc00, 1);
    g.fillCircle(0, -130, 5);

    this.fallback.add(g);

    // Idle bob
    gsap.timeline({ repeat: -1 })
      .to(this.fallback, { y: this.y - 8, duration: 0.9, ease: 'sine.inOut' })
      .to(this.fallback, { y: this.y,     duration: 0.9, ease: 'sine.inOut' });
  }

  destroy(): void {
    this.spineObj?.destroy();
    this.fallback?.destroy();
  }
}
