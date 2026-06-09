import Phaser from 'phaser';
import { gsap } from 'gsap';
import { useSpinButton, SpinButtonLogic } from './use-spin-button';
import { FontFamily, FontSize } from '../../enums/fonts';
import { CssColor, PhaserColor } from '../../enums/colors';
import { SpinBtn } from '../../enums/ui-layout';
import { AnimDuration, AnimEase } from '../../enums/animation';

export class SpinButtonComponent {
  private scene:     Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private bg:        Phaser.GameObjects.Graphics;
  private label:     Phaser.GameObjects.Text;
  private logic:     SpinButtonLogic;
  private onClickCb: () => void;

  constructor(scene: Phaser.Scene, x: number, y: number, onClick: () => void) {
    this.scene     = scene;
    this.onClickCb = onClick;
    this.logic     = useSpinButton();
    this.container = scene.add.container(x, y);

    this.bg = scene.add.graphics();
    this.drawButton();

    this.label = scene.add.text(0, 0, this.logic.getLabel(), {
      fontFamily: FontFamily.Heading,
      fontSize:   FontSize.Xl,
      color:      CssColor.White,
      stroke:     CssColor.Black,
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.container.add([this.bg, this.label]);
    this.setupInteractivity();
  }

  private setupInteractivity(): void {
    this.bg.setInteractive(
      new Phaser.Geom.Circle(0, 0, SpinBtn.HitR),
      Phaser.Geom.Circle.Contains,
    );

    this.bg.on('pointerover', () => {
      if (!this.logic.isDisabled()) {
        this.scene.input.setDefaultCursor('pointer');
        gsap.to(this.container, { scaleX: 1.07, scaleY: 1.07, duration: AnimDuration.Normal });
      }
    });

    this.bg.on('pointerout', () => {
      this.scene.input.setDefaultCursor('default');
      gsap.to(this.container, { scaleX: 1, scaleY: 1, duration: AnimDuration.Normal });
    });

    this.bg.on('pointerdown', () => {
      if (!this.logic.isDisabled()) {
        gsap.to(this.container, { scaleX: 0.93, scaleY: 0.93, duration: AnimDuration.Fast });
      }
    });

    this.bg.on('pointerup', () => {
      if (!this.logic.isDisabled()) {
        gsap.to(this.container, { scaleX: 1, scaleY: 1, duration: AnimDuration.Fast });
        this.onClickCb();
      }
    });
  }

  private drawButton(): void {
    this.bg.clear();
    const { fill, stroke } = this.logic.getColors();
    const R = SpinBtn.R;

    if (this.logic.isDisabled()) {
      // Disabled state
      this.bg.fillStyle(0x000000, SpinBtn.ShadowAlpha);
      this.bg.fillCircle(3, 4, R);
      this.bg.fillStyle(0x333333, 1);
      this.bg.fillCircle(0, 0, R);
      this.bg.fillStyle(0x444444, 0.3);
      this.bg.fillEllipse(0, -R * 0.3, R * 1.2, R * 0.7);
      this.bg.lineStyle(SpinBtn.BorderWidth, 0x555555, 0.8);
      this.bg.strokeCircle(0, 0, R);
      return;
    }

    // Outer glow ring
    this.bg.fillStyle(0xffd700, 0.12);
    this.bg.fillCircle(0, 0, SpinBtn.RingR);
    this.bg.lineStyle(2, 0xffd700, 0.3);
    this.bg.strokeCircle(0, 0, SpinBtn.RingR);

    // Drop shadow
    this.bg.fillStyle(0x000000, SpinBtn.ShadowAlpha);
    this.bg.fillCircle(3, 5, R);

    // Outer ring (slightly darker)
    this.bg.fillStyle(0xaa6600, 1);
    this.bg.fillCircle(0, 0, R);

    // Main body
    this.bg.fillStyle(fill, 1);
    this.bg.fillCircle(0, 0, R - 3);

    // Top highlight (simulate gradient)
    this.bg.fillStyle(PhaserColor.White, SpinBtn.HighlightA);
    this.bg.fillEllipse(0, -R * 0.32, R * 1.2, R * 0.65);

    // Gold border
    this.bg.lineStyle(SpinBtn.BorderWidth, stroke, 1);
    this.bg.strokeCircle(0, 0, R);

    // Inner accent ring
    this.bg.lineStyle(1.5, 0xffee44, 0.35);
    this.bg.strokeCircle(0, 0, R - 7);
  }

  setDisabled(disabled: boolean): void {
    this.logic.setDisabled(disabled);
    this.drawButton();
    this.label.setColor(this.logic.getColors().textColor);
  }

  setLabel(text: string): void {
    this.logic.setLabel(text);
    this.label.setText(text);
  }

  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  pulse(): void {
    gsap.timeline()
      .to(this.container, { scaleX: 1.1, scaleY: 1.1, duration: AnimDuration.Medium, ease: AnimEase.Out })
      .to(this.container, { scaleX: 1,   scaleY: 1,   duration: AnimDuration.Medium, ease: AnimEase.In })
      .repeat(2);
  }
}
