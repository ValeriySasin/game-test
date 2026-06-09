import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, ASSETS } from '../types/constants';
import { CssColor, PhaserColor } from '../enums/colors';
import { FontFamily, FontSize } from '../enums/fonts';
import { UiText } from '../enums/ui-text';
import { AnimDuration } from '../enums/animation';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.PRELOAD });
  }

  preload(): void {
    this.createLoadingUI();
    this.loadAssets();
  }

  private createLoadingUI(): void {
    const cx = GAME_WIDTH  / 2;
    const cy = GAME_HEIGHT / 2;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, PhaserColor.BgDark).setOrigin(0);

    for (let i = 0; i < 60; i++) {
      const star = this.add.circle(
        Math.random() * GAME_WIDTH,
        Math.random() * GAME_HEIGHT,
        Math.random() * 2 + 0.5,
        PhaserColor.White,
        Math.random() * 0.7 + 0.3,
      );
      this.tweens.add({
        targets:  star,
        alpha:    0.1,
        duration: 800 + Math.random() * 1200,
        yoyo:     true,
        repeat:   -1,
        delay:    Math.random() * 1000,
      });
    }

    this.add.text(cx, cy - 180, UiText.TitleShort, {
      fontFamily:      FontFamily.Heading,
      fontSize:        FontSize.Hero,
      color:           CssColor.Gold,
      stroke:          CssColor.PurpleDark,
      strokeThickness: 8,
      shadow:          { offsetX: 3, offsetY: 3, color: CssColor.Black, blur: 8, fill: true },
    }).setOrigin(0.5);

    this.add.text(cx, cy - 120, UiText.Loading, {
      fontFamily: FontFamily.Body,
      fontSize:   FontSize.Md,
      color:      CssColor.LavenderHint,
    }).setOrigin(0.5);

    const barBg = this.add.graphics();
    barBg.fillStyle(PhaserColor.Black, 0.6);
    barBg.fillRoundedRect(cx - 210, cy - 20, 420, 40, 20);
    barBg.lineStyle(2, PhaserColor.PurpleBar, 1);
    barBg.strokeRoundedRect(cx - 210, cy - 20, 420, 40, 20);

    const bar     = this.add.graphics();
    const pctText = this.add.text(cx, cy + 40, '0%', {
      fontFamily: FontFamily.Body,
      fontSize:   FontSize.Md,
      color:      CssColor.LavenderUI,
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      bar.clear();
      const barW = 400 * value;
      if (barW > 0) {
        bar.fillGradientStyle(PhaserColor.PurpleGrad1, PhaserColor.PinkGrad, PhaserColor.PinkGrad, PhaserColor.PurpleGrad1, 1);
        bar.fillRoundedRect(cx - 200, cy - 14, barW, 28, 14);
        bar.fillStyle(PhaserColor.White, 0.25);
        bar.fillRoundedRect(cx - 200, cy - 14, barW, 12, { tl: 14, tr: 14, bl: 0, br: 0 });
      }
      pctText.setText(`${Math.floor(value * 100)}%`);
    });

    this.load.on('complete', () => {
      pctText.setText('100%');
      bar.clear();
      bar.fillGradientStyle(PhaserColor.PurpleGrad1, PhaserColor.PinkGrad, PhaserColor.PinkGrad, PhaserColor.PurpleGrad1, 1);
      bar.fillRoundedRect(cx - 200, cy - 14, 400, 28, 14);

      this.time.delayedCall(AnimDuration.SceneIntro, () => {
        this.cameras.main.fadeOut(AnimDuration.CameraFade, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(SCENES.GAME);
        });
      });
    });
  }

  private loadAssets(): void {
    // Audio is generated procedurally via ProceduralSounds (Web Audio API).

    // Load Spine spineboy (Spine 3.8 format via SpinePlugin)
    // @ts-expect-error — SpinePlugin extends the loader with .spine()
    if (this.load.spine) {
      // @ts-expect-error — SpinePlugin extends the loader with .spine()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this.load.spine(
        ASSETS.SPINE_GOBLIN,
        'assets/spine/spineboy.json',
        ['assets/spine/spineboy.atlas'],
      );
    }
  }

  create(): void {
    // Spine assets are loaded in preload(), so the Phaser loader fires 'complete'
    // AFTER create() is called when there are real files. The 'complete' handler
    // above takes care of the transition with fade animation.
    // Nothing needed here — transition is handled by the 'complete' callback.
  }
}
