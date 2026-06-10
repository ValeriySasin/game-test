import Phaser from 'phaser';
import { gsap } from 'gsap';
import {
  SCENES, GAME_WIDTH, GAME_HEIGHT, ASSETS,
  REEL_COUNT, SYMBOL_SIZE, REEL_SPACING, SPIN_STAGGER,
  PAYTABLE, SYMBOL_ASSET_MAP,
} from '@/types/constants';
import { ReelComponent } from '@/components/reel/reel-component';
import { SpinButtonComponent } from '@/components/spin-button/spin-button-component';
import { SoundManagerComponent } from '@/components/sound-manager/sound-manager-component';
import { SpineCharacterComponent } from '@/components/spine-character/spine-character-component';
import { AssetGenerator } from '@/utils/AssetGenerator';
import { drawInfoBox, addLabelValue } from '@/utils/draw-helpers';
import { gameApi, playerApi } from '@/api';
import { GameState } from '@/types';
import { CssColor, PhaserColor } from '@/enums/colors';
import { FontFamily, FontSize } from '@/enums/fonts';
import { UiText } from '@/enums/ui-text';
import { AnimDuration, AnimDurationMs, AnimEase } from '@/enums/animation';
import { ReelFrame } from '@/enums/ui-layout';

const CX       = GAME_WIDTH  / 2;
const HEADER_Y = Math.round(GAME_HEIGHT * 0.07);
const FRAME_CY = Math.round(GAME_HEIGHT * 0.38);
// AssetGenerator bakes the frame sprite at 750 px; FRAME_W=720 intentionally
// displays it slightly squished so the frame hugs the reels more tightly.
const FRAME_W  = REEL_COUNT * SYMBOL_SIZE + (REEL_COUNT - 1) * REEL_SPACING + 60;
const FRAME_H  = SYMBOL_SIZE + 50;
const UI_Y     = Math.round(GAME_HEIGHT * 0.72);
const HELP_Y   = GAME_HEIGHT - 16;

export class GameScene extends Phaser.Scene {
  private reels:        ReelComponent[] = [];
  private spinButton!:  SpinButtonComponent;
  private soundManager!: SoundManagerComponent;
  /** Stored so it can be killed if the scene shuts down mid-win. */
  private winBannerTimeline: gsap.core.Timeline | null = null;

  private balanceText!: Phaser.GameObjects.Text;
  private betText!:     Phaser.GameObjects.Text;
  private betMinusBtn!: Phaser.GameObjects.Container;
  private betPlusBtn!:  Phaser.GameObjects.Container;
  private winBanner!:       Phaser.GameObjects.Container;
  private winText!:         Phaser.GameObjects.Text;
  private winLabelText!:    Phaser.GameObjects.Text;
  private soundBtn!:        Phaser.GameObjects.Text;
  private particles?:       Phaser.GameObjects.Particles.ParticleEmitter;
  private paytableModal!:   Phaser.GameObjects.Container;
  private goblin!:          SpineCharacterComponent;

  // TODO: populate from auth token / playerApi.getProfile() when real backend is integrated
  private sessionId: string = 'mock-session';

  private state: GameState = {
    balance: 0,
    bet: 10,
    betSteps: [1, 5, 10, 25, 50, 100],
    betStepIndex: 2, // default: 10
    isSpinning: false,
  };

  constructor() {
    super({ key: SCENES.GAME });
  }

  create(): void {
    AssetGenerator.generate(this);
    this.cameras.main.fadeIn(AnimDurationMs.CameraFade, 0, 0, 0);

    this.createBackground();
    this.createHeader();
    this.createReelArea();
    this.createReels();
    this.createReelFades();
    this.createUI();
    this.createWinBanner();
    this.createParticles();
    this.createPaytableModal();
    this.createGoblin();

    this.soundManager = new SoundManagerComponent();
    this.soundManager.init();

    void this.loadPlayerData();
    this.playIntroAnimation();
  }

  // ── Background ────────────────────────────────────────────────────────

  private createBackground(): void {
    this.add.image(0, 0, ASSETS.BG).setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    for (let i = 0; i < 20; i++) {
      const sparkle = this.add.text(
        Math.random() * GAME_WIDTH,
        Math.random() * GAME_HEIGHT * 0.85,
        UiText.SparkleChar,
        { fontSize: `${8 + Math.random() * 16}px`, color: CssColor.Gold },
      ).setAlpha(0);

      this.tweens.add({
        targets:  sparkle,
        alpha:    { from: 0, to: 0.65 },
        y:        `-=${30 + Math.random() * 40}`,
        duration: 2000 + Math.random() * 2500,
        repeat:   -1,
        yoyo:     true,
        delay:    Math.random() * 4000,
        ease:     AnimEase.SineInOut,
      });
    }
  }

  // ── Header ────────────────────────────────────────────────────────────

  private createHeader(): void {
    this.add.text(CX, HEADER_Y, UiText.Title, {
      fontFamily:      FontFamily.Title,
      fontSize:        `${Math.round(GAME_HEIGHT * 0.048)}px`,
      color:           CssColor.Gold,
      stroke:          CssColor.Purple,
      strokeThickness: 5,
      shadow:          { offsetX: 0, offsetY: 4, color: '#110033', blur: 16, fill: true },
    }).setOrigin(0.5);

    this.soundBtn = this.add.text(GAME_WIDTH - 44, 22, UiText.SoundOn, {
      fontSize: FontSize.Xl,
      color:    CssColor.White,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.soundBtn.on('pointerdown', () => {
      const enabled = this.soundManager.toggle();
      this.soundBtn.setText(enabled ? UiText.SoundOn : UiText.SoundOff);
      gsap.fromTo(
        this.soundBtn,
        { scaleX: 1.4, scaleY: 1.4 },
        { scaleX: 1, scaleY: 1, duration: AnimDuration.Medium },
      );
    });
  }

  // ── Reel frame ────────────────────────────────────────────────────────

  private createReelArea(): void {
    const fx = CX - FRAME_W / 2;
    const fy = FRAME_CY - FRAME_H / 2;

    const glow = this.add.graphics();
    glow.fillStyle(PhaserColor.Purple, ReelFrame.GlowAlpha);
    glow.fillRoundedRect(
      fx - ReelFrame.GlowPad, fy - ReelFrame.GlowPad,
      FRAME_W + ReelFrame.GlowPad * 2, FRAME_H + ReelFrame.GlowPad * 2,
      ReelFrame.GlowRadius,
    );

    this.add.image(CX, FRAME_CY, ASSETS.REEL_FRAME)
      .setOrigin(0.5)
      .setDisplaySize(FRAME_W, FRAME_H);

    // Left pillar ornament
    const leftPillar = this.add.graphics();
    leftPillar.lineStyle(3, PhaserColor.Gold, 0.6);
    leftPillar.lineBetween(CX - FRAME_W / 2 - 20, FRAME_CY - FRAME_H / 2 - 10, CX - FRAME_W / 2 - 20, FRAME_CY + FRAME_H / 2 + 10);
    leftPillar.fillStyle(PhaserColor.Gold, 0.7);
    leftPillar.fillCircle(CX - FRAME_W / 2 - 20, FRAME_CY - FRAME_H / 2 - 10, 5);
    leftPillar.fillCircle(CX - FRAME_W / 2 - 20, FRAME_CY + FRAME_H / 2 + 10, 5);
    // Right pillar ornament
    const rightPillar = this.add.graphics();
    rightPillar.lineStyle(3, PhaserColor.Gold, 0.6);
    rightPillar.lineBetween(CX + FRAME_W / 2 + 20, FRAME_CY - FRAME_H / 2 - 10, CX + FRAME_W / 2 + 20, FRAME_CY + FRAME_H / 2 + 10);
    rightPillar.fillStyle(PhaserColor.Gold, 0.7);
    rightPillar.fillCircle(CX + FRAME_W / 2 + 20, FRAME_CY - FRAME_H / 2 - 10, 5);
    rightPillar.fillCircle(CX + FRAME_W / 2 + 20, FRAME_CY + FRAME_H / 2 + 10, 5);
  }

  // ── Reels ─────────────────────────────────────────────────────────────

  private createReels(): void {
    const totalW = REEL_COUNT * SYMBOL_SIZE + (REEL_COUNT - 1) * REEL_SPACING;
    const startX = CX - totalW / 2 + SYMBOL_SIZE / 2;

    for (let i = 0; i < REEL_COUNT; i++) {
      const x    = startX + i * (SYMBOL_SIZE + REEL_SPACING);
      const reel = new ReelComponent(this, x, FRAME_CY);

      const mask = this.add.graphics();
      mask.fillStyle(PhaserColor.White);
      mask.fillRect(x - SYMBOL_SIZE / 2, FRAME_CY - SYMBOL_SIZE / 2, SYMBOL_SIZE, SYMBOL_SIZE);
      mask.setVisible(false);
      reel.getContainer().setMask(mask.createGeometryMask());

      this.reels.push(reel);
    }
  }

  // ── Reel fade overlays ────────────────────────────────────────────────
  // Dark gradient at top/bottom of each cell — hides partial symbols during spin
  private createReelFades(): void {
    const totalW  = REEL_COUNT * SYMBOL_SIZE + (REEL_COUNT - 1) * REEL_SPACING;
    const startX  = CX - totalW / 2 + SYMBOL_SIZE / 2;
    const fadeH   = 48;
    const cellTop = FRAME_CY - SYMBOL_SIZE / 2;
    const cellBot = FRAME_CY + SYMBOL_SIZE / 2;
    const bg      = 0x020108; // matches reel cell background colour

    const g = this.add.graphics();
    for (let i = 0; i < REEL_COUNT; i++) {
      const rx = startX + i * (SYMBOL_SIZE + REEL_SPACING);
      const lx = rx - SYMBOL_SIZE / 2;

      // Top fade: opaque bg → transparent
      g.fillGradientStyle(bg, bg, bg, bg, 1, 1, 0, 0);
      g.fillRect(lx, cellTop, SYMBOL_SIZE, fadeH);

      // Bottom fade: transparent → opaque bg
      g.fillGradientStyle(bg, bg, bg, bg, 0, 0, 1, 1);
      g.fillRect(lx, cellBot - fadeH, SYMBOL_SIZE, fadeH);
    }
  }

  // ── UI controls ───────────────────────────────────────────────────────

  private createUI(): void {
    const colSpacing = Math.round(GAME_WIDTH * 0.22);
    const balX = CX - colSpacing;
    const betX = CX + colSpacing;

    // Bottom panel background
    this.add.image(CX, UI_Y, ASSETS.BOTTOM_PANEL)
      .setOrigin(0.5, 0.5)
      .setDisplaySize(GAME_WIDTH, 140);

    // Balance box
    drawInfoBox(this.add.graphics(), balX, UI_Y);
    this.balanceText = addLabelValue(this, balX, UI_Y, UiText.Balance, `$${this.state.balance}`);

    // Bet box
    drawInfoBox(this.add.graphics(), betX, UI_Y);
    this.betText = addLabelValue(this, betX, UI_Y, UiText.Bet, `$${this.state.bet}`, CssColor.Gold);

    // Bet − button
    this.betMinusBtn = this.createBetButton(betX - 62, UI_Y + 12, '−', () => this.changeBet(-1));

    // Bet + button
    this.betPlusBtn  = this.createBetButton(betX + 62, UI_Y + 12, '+', () => this.changeBet(+1));

    // Spin button
    this.spinButton = new SpinButtonComponent(this, CX, UI_Y, () => this.onSpinClicked());

    // Help text
    this.add.text(CX, HELP_Y, UiText.HelpText, {
      fontFamily: FontFamily.Body,
      fontSize:   FontSize.Sm,
      color:      CssColor.LavenderDim,
    }).setOrigin(0.5, 1);

    // Info button
    this.createBetButton(GAME_WIDTH - 120, GAME_HEIGHT - 60, 'ℹ', () => this.showPaytableModal());
  }

  private createBetButton(
    x: number, y: number, label: string, onClick: () => void,
  ): Phaser.GameObjects.Container {
    const R = 20;
    const bg = this.add.graphics();

    const drawBg = (hover = false) => {
      bg.clear();
      // Shadow
      bg.fillStyle(PhaserColor.Black, 0.4);
      bg.fillCircle(2, 3, R);
      // Outer ring
      bg.fillStyle(hover ? PhaserColor.Gold : PhaserColor.GoldRim, 1);
      bg.fillCircle(0, 0, R);
      // Main fill
      bg.fillStyle(hover ? PhaserColor.Gold : PhaserColor.OrangeBtn, 1);
      bg.fillCircle(0, 0, R - 2);
      // Highlight
      bg.fillStyle(PhaserColor.White, 0.2);
      bg.fillEllipse(0, -R * 0.28, R * 1.1, R * 0.55);
      // Border
      bg.lineStyle(2, hover ? PhaserColor.GoldLight : PhaserColor.Gold, 1);
      bg.strokeCircle(0, 0, R);
    };

    drawBg(false);

    const txt = this.add.text(0, 0, label, {
      fontFamily: FontFamily.Heading,
      fontSize:   FontSize.Lg,
      color:      CssColor.White,
    }).setOrigin(0.5);

    const btn = this.add.container(x, y, [bg, txt]);
    btn.setSize((R + 4) * 2, (R + 4) * 2);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover',  () => drawBg(true));
    btn.on('pointerout',   () => drawBg(false));
    btn.on('pointerdown',  onClick);

    return btn;
  }

  private changeBet(direction: 1 | -1): void {
    if (this.state.isSpinning) return;

    const steps = this.state.betSteps;
    const next  = this.state.betStepIndex + direction;
    if (next < 0 || next >= steps.length) return;

    this.state.betStepIndex = next;
    this.state.bet          = steps[next];
    this.betText.setText(`$${this.state.bet}`);

    gsap.fromTo(
      this.betText,
      { scaleX: 1.3, scaleY: 1.3 },
      { scaleX: 1,   scaleY: 1,   duration: AnimDuration.Slow, ease: AnimEase.BackOutHard },
    );

    // Dim the edge buttons when at min/max
    this.betMinusBtn.setAlpha(next === 0              ? 0.35 : 1);
    this.betPlusBtn.setAlpha( next === steps.length - 1 ? 0.35 : 1);
  }

  // ── Win banner ────────────────────────────────────────────────────────

  private createWinBanner(): void {
    this.winBanner = this.add.container(CX, FRAME_CY).setAlpha(0);

    const bg = this.add.image(0, 0, ASSETS.WIN_BANNER)
      .setOrigin(0.5)
      .setDisplaySize(480, 110);

    this.winLabelText = this.add.text(0, -18, '', {
      fontFamily:      FontFamily.Heading,
      fontSize:        FontSize.Xxl,
      color:           CssColor.WinTextDark,
      stroke:          CssColor.White,
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.winText = this.add.text(0, 26, '', {
      fontFamily: FontFamily.Heading,
      fontSize:   FontSize.Lg,
      color:      CssColor.WinTextDark,
    }).setOrigin(0.5);

    this.winBanner.add([bg, this.winLabelText, this.winText]);
  }

  // ── Paytable modal ────────────────────────────────────────────────────

  private createPaytableModal(): void {
    const MODAL_W = 700;
    const MODAL_H = 560;

    const container = this.add.container(CX, GAME_HEIGHT / 2);
    container.setVisible(false);
    container.setAlpha(0);
    container.setDepth(100);

    // Backdrop overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(PhaserColor.Black, 0.7);
    overlay.fillRect(-GAME_WIDTH / 2, -GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT);

    // Panel background
    const panel = this.add.graphics();
    panel.fillStyle(PhaserColor.PanelDark, 1);
    panel.fillRoundedRect(-MODAL_W / 2, -MODAL_H / 2, MODAL_W, MODAL_H, 20);
    panel.lineStyle(3, PhaserColor.Gold, 1);
    panel.strokeRoundedRect(-MODAL_W / 2, -MODAL_H / 2, MODAL_W, MODAL_H, 20);

    // Title
    const title = this.add.text(0, -MODAL_H / 2 + 40, 'PAYTABLE', {
      fontFamily:      FontFamily.Title,
      fontSize:        FontSize.Xxl,
      color:           CssColor.Gold,
      stroke:          CssColor.Purple,
      strokeThickness: 3,
    }).setOrigin(0.5);

    container.add([overlay, panel, title]);

    const rowStartY = -MODAL_H / 2 + 110;
    const rowHeight = 76;

    PAYTABLE.forEach((row, i) => {
      const rowY = rowStartY + i * rowHeight;

      // Symbol images
      const count = row.count;
      const sym   = row.symbols[0];
      const asset = SYMBOL_ASSET_MAP[sym];

      for (let j = 0; j < count; j++) {
        const imgX = -280 + j * 70;
        const img  = this.add.image(imgX, rowY, asset).setDisplaySize(56, 56);
        container.add(img);
      }

      // Count label
      const countLabel = count === 3
        ? '× 3'
        : '× 2  any position';
      const comboTxt = this.add.text(-100, rowY, countLabel, {
        fontFamily: FontFamily.Heading,
        fontSize:   FontSize.Lg,
        color:      CssColor.White,
      }).setOrigin(0, 0.5);
      container.add(comboTxt);

      // Multiplier
      const multTxt = this.add.text(120, rowY, `×${row.multiplier} BET`, {
        fontFamily: FontFamily.Heading,
        fontSize:   FontSize.Lg,
        color:      CssColor.Gold,
      }).setOrigin(0, 0.5);
      container.add(multTxt);

      // Label
      const labelTxt = this.add.text(290, rowY, row.label, {
        fontFamily:      FontFamily.Heading,
        fontSize:        FontSize.Lg,
        color:           CssColor.GoldLight,
        stroke:          CssColor.Purple,
        strokeThickness: 2,
      }).setOrigin(0, 0.5);
      container.add(labelTxt);

      // Divider line (skip last)
      if (i < PAYTABLE.length - 1) {
        const line = this.add.graphics();
        line.lineStyle(1, PhaserColor.Gold, 0.25);
        line.lineBetween(-MODAL_W / 2 + 30, rowY + rowHeight / 2, MODAL_W / 2 - 30, rowY + rowHeight / 2);
        container.add(line);
      }
    });

    // Close button
    const closeBtnTxt = this.add.text(0, MODAL_H / 2 - 40, '✕  CLOSE', {
      fontFamily:      FontFamily.Heading,
      fontSize:        FontSize.Xl,
      color:           CssColor.White,
      backgroundColor: '#441100',
      padding:         { x: 24, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtnTxt.on('pointerover',  () => closeBtnTxt.setColor(CssColor.Gold));
    closeBtnTxt.on('pointerout',   () => closeBtnTxt.setColor(CssColor.White));
    closeBtnTxt.on('pointerdown',  () => this.hidePaytableModal());

    container.add(closeBtnTxt);

    this.paytableModal = container;
  }

  private showPaytableModal(): void {
    if (this.state.isSpinning) return;
    this.paytableModal.setVisible(true);
    this.tweens.add({
      targets:  this.paytableModal,
      alpha:    1,
      duration: 250,
      ease:     AnimEase.SineOut,
    });
  }

  private hidePaytableModal(): void {
    this.tweens.add({
      targets:   this.paytableModal,
      alpha:     0,
      duration:  200,
      ease:      AnimEase.SineIn,
      onComplete: () => this.paytableModal.setVisible(false),
    });
  }

  // ── Goblin character ──────────────────────────────────────────────────

  private createGoblin(): void {
    const totalW  = REEL_COUNT * SYMBOL_SIZE + (REEL_COUNT - 1) * REEL_SPACING;
    const frameLeft = CX - totalW / 2 - 30;
    const goblinX   = Math.round(frameLeft / 2);   // centre of left empty space
    const goblinY   = Math.round(FRAME_CY + 60);   // vertically align with reels
    this.goblin = new SpineCharacterComponent(this, goblinX, goblinY);
  }

  // ── Particles ─────────────────────────────────────────────────────────

  private createParticles(): void {
    // ASSETS.PARTICLE is always available — AssetGenerator.generate() runs before this.
    this.particles = this.add.particles(0, 0, ASSETS.PARTICLE, {
      x:         { min: CX - 220, max: CX + 220 },
      y:         FRAME_CY - 30,
      speed:     { min: 120, max: 320 },
      angle:     { min: -100, max: -80 },
      scale:     { start: 1, end: 0 },
      alpha:     { start: 1, end: 0 },
      lifespan:  1400,
      gravityY:  220,
      quantity:  4,
      frequency: 35,
      tint:      [PhaserColor.Gold, PhaserColor.OrangeGrad, PhaserColor.PinkGrad, PhaserColor.CyanGrad],
      emitting:  false,
    });
  }

  // ── Intro ─────────────────────────────────────────────────────────────

  private playIntroAnimation(): void {
    gsap.from(this.spinButton.getContainer(), {
      y:        `+=${Math.round(GAME_HEIGHT * 0.1)}`,
      alpha:    0,
      duration: AnimDuration.Entrance,
      delay:    0.4,
      ease:     AnimEase.BackOut,
    });
  }

  // ── Load player data from API ─────────────────────────────────────────

  private async loadPlayerData(): Promise<void> {
    try {
      const [profileRes, sessionRes] = await Promise.all([
        playerApi.getProfile(),
        gameApi.getConfig(),
      ]);
      this.state.balance  = profileRes.data.balance;
      const cfg           = sessionRes.data;
      const steps: number[] = cfg.betSteps?.length ? cfg.betSteps : this.state.betSteps;
      this.state.betSteps = steps;
      const clampedBet    = Math.min(Math.max(this.state.bet, cfg.betMin), cfg.betMax);
      const idx           = steps.indexOf(clampedBet);
      this.state.betStepIndex = idx >= 0 ? idx : 0;
      this.state.bet          = steps[this.state.betStepIndex];
      this.betText.setText(`$${this.state.bet}`);
      // Sync edge-button opacity to the loaded betStepIndex (same logic as changeBet)
      this.betMinusBtn.setAlpha(this.state.betStepIndex === 0                       ? 0.35 : 1);
      this.betPlusBtn.setAlpha( this.state.betStepIndex === this.state.betSteps.length - 1 ? 0.35 : 1);
      this.updateBalance();
    } catch (e) {
      console.error('Failed to load player data', e);
      this.add.text(CX, UI_Y - 60, '⚠ Failed to load player data', {
        fontFamily: FontFamily.Body,
        fontSize:   FontSize.Sm,
        color:      '#ff4444',
      }).setOrigin(0.5).setDepth(50);
    }
  }

  // ── Spin ──────────────────────────────────────────────────────────────

  private async onSpinClicked(): Promise<void> {
    if (this.state.isSpinning) return;

    // Prevent spinning with insufficient balance
    if (this.state.balance < this.state.bet) return;

    this.state.isSpinning = true;
    this.spinButton.setDisabled(true);
    this.spinButton.setLabel(UiText.SpinLoading);

    this.soundManager.play(ASSETS.SFX_CLICK);
    this.hideWinBanner();

    // Deduct bet immediately so the player sees it right away
    this.state.balance -= this.state.bet;
    this.updateBalance();

    let result;
    try {
      const res = await gameApi.spin({ bet: this.state.bet, sessionId: this.sessionId });
      result = res.data;
    } catch (e) {
      console.error('Spin request failed', e);
      // Rollback the optimistic deduction
      this.state.balance += this.state.bet;
      this.updateBalance();
      this.state.isSpinning = false;
      this.spinButton.setDisabled(false);
      this.spinButton.setLabel(UiText.SpinLabel);
      return;
    }

    this.soundManager.play(ASSETS.SFX_SPIN);
    this.goblin.onSpin();

    await Promise.all(
      this.reels.map((reel, i) => reel.spin(result.symbols[i], i * SPIN_STAGGER)),
    );

    // Guard: scene may have been destroyed while reels were spinning
    if (!this.scene.isActive(SCENES.GAME)) return;

    this.soundManager.play(ASSETS.SFX_STOP);

    // Brief pause so the player can see the landed symbols before the win banner appears
    await new Promise<void>(r => this.time.delayedCall(AnimDurationMs.SpinResultPause, r));

    if (!this.scene.isActive(SCENES.GAME)) return;

    if (result.isWin) {
      // Sync to server balance (bet already deducted visually; server added winAmount)
      this.state.balance = result.newBalance;
      this.goblin.onWin();
      await this.handleWin(result.winAmount, result.winLabel);
    } else {
      // Sync to server balance to stay consistent
      this.state.balance = result.newBalance;
      this.updateBalance();
      this.goblin.onIdle();
    }

    this.state.isSpinning = false;
    this.spinButton.setDisabled(false);
    this.spinButton.setLabel(UiText.SpinLabel);
  }

  private handleWin(amount: number, label: string): Promise<void> {
    return new Promise(resolve => {
      this.updateBalance();

      this.reels.forEach((reel, i) => {
        this.time.delayedCall(i * 120, () => reel.playWinAnimation());
      });

      this.soundManager.play(ASSETS.SFX_WIN);

      this.winLabelText.setText(label);
      this.winText.setText(`+$${amount}`);
      this.winBanner.setAlpha(0).setPosition(CX, FRAME_CY);

      this.winBannerTimeline?.kill();
      this.winBannerTimeline = gsap.timeline({
        onComplete: () => { this.winBannerTimeline = null; },
      })
        .to(this.winBanner,   { alpha: 1, duration: AnimDuration.Slow, ease: AnimEase.Out })
        .from(this.winBanner, { scaleX: 0.5, scaleY: 0.5, duration: AnimDuration.SlowFade, ease: AnimEase.BackOutHard }, '<')
        .call(() => {
          if (this.particles) {
            this.particles.start();
            this.time.delayedCall(2000, () => this.particles?.stop());
          }
        })
        .to(this.winBanner, { alpha: 0, duration: AnimDuration.SlowFade, delay: 2.2 })
        .call(() => resolve());
    });
  }

  private hideWinBanner(): void {
    this.winBannerTimeline?.kill();
    this.winBannerTimeline = null;
    gsap.to(this.winBanner, { alpha: 0, duration: 0.15 });
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────

  shutdown(): void {
    this.winBannerTimeline?.kill();
    this.winBannerTimeline = null;
    this.reels.forEach(r => r.destroy());
    gsap.killTweensOf(this.spinButton.getContainer());
    this.goblin.destroy();
    this.soundManager.destroy();
  }

  private updateBalance(): void {
    this.balanceText.setText(`$${this.state.balance}`);
    // Kill any in-flight scale animation before starting a new one so rapid
    // calls (e.g. optimistic deduction followed immediately by a win) don't pile up.
    gsap.killTweensOf(this.balanceText);
    gsap.timeline()
      .to(this.balanceText, { scaleX: 1.3, scaleY: 1.3, duration: AnimDuration.Normal })
      .to(this.balanceText, { scaleX: 1,   scaleY: 1,   duration: AnimDuration.Slow, ease: AnimEase.BackOutHard });
  }
}
