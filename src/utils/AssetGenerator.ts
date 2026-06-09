import Phaser from 'phaser';
import { ASSETS } from '../types/constants';
import { bakeTexture, bakeTextureRich, makeGraphics } from './draw-helpers';

export class AssetGenerator {
  static generate(scene: Phaser.Scene): void {
    AssetGenerator.createBackground(scene);
    AssetGenerator.createReelFrame(scene);
    AssetGenerator.createSymbols(scene);
    AssetGenerator.createParticle(scene);
    AssetGenerator.createWinBanner(scene);
    AssetGenerator.createLogo(scene);
    AssetGenerator.createBottomPanel(scene);
  }

  private static createBackground(scene: Phaser.Scene): void {
    const W = 1920, H = 1080;
    bakeTexture(scene, ASSETS.BG, W, H, g => {
      // Rich deep dark base
      g.fillGradientStyle(0x030112, 0x030112, 0x08022c, 0x08022c, 1);
      g.fillRect(0, 0, W, H);

      // Large soft atmospheric glows
      g.fillStyle(0x1a0550, 0.22); g.fillCircle(W/2, H*0.38, 780);
      g.fillStyle(0x2a0870, 0.14); g.fillCircle(W/2, H*0.28, 500);
      g.fillStyle(0x160440, 0.18); g.fillCircle(W/2, H*0.22, 320);

      // Warm gold glow from bottom center
      g.fillStyle(0x3a1500, 0.14); g.fillCircle(W/2, H*1.1, 600);
      g.fillStyle(0x5a2800, 0.08); g.fillCircle(W/2, H*1.05, 440);

      // Side accent glows
      g.fillStyle(0x0a0330, 0.3); g.fillCircle(0,   H/2, 460);
      g.fillStyle(0x0a0330, 0.3); g.fillCircle(W,   H/2, 460);

      // Corner vignette
      g.fillStyle(0x000000, 0.55); g.fillCircle(0, 0,   440);
      g.fillStyle(0x000000, 0.55); g.fillCircle(W, 0,   440);
      g.fillStyle(0x000000, 0.45); g.fillCircle(0, H,   400);
      g.fillStyle(0x000000, 0.45); g.fillCircle(W, H,   400);

      // Stars
      g.fillStyle(0xffffff, 0.5);
      for (let i = 0; i < 140; i++) {
        g.fillCircle((i * 137 + 23) % W, (i * 89 + 11) % H, (i % 7 === 0) ? 2 : 1);
      }
      // Gold dust sparkles
      g.fillStyle(0xffd700, 0.38);
      for (let i = 0; i < 28; i++) {
        g.fillCircle((i * 311 + 57) % W, (i * 193 + 41) % H, 1.5);
      }
    });
  }

  private static createReelFrame(scene: Phaser.Scene): void {
    // SYMBOL_SIZE=200, REEL_SPACING=30 → FRAME_W=750, FRAME_H=250
    const w = 750, h = 250;
    bakeTexture(scene, ASSETS.REEL_FRAME, w, h, g => {
      // Outer glow
      g.fillStyle(0xffd700, 0.08);
      g.fillRoundedRect(-10, -10, w + 20, h + 20, 36);

      // Drop shadow
      g.fillStyle(0x000000, 0.55);
      g.fillRoundedRect(6, 9, w, h, 28);

      // Main frame body
      g.fillStyle(0x070320, 1);
      g.fillRoundedRect(0, 0, w, h, 28);

      // Cell backgrounds — 3 cells matching reel positions
      // cells start at x=30, each 200px wide, gap of 30
      const cellY = 16, cellH = h - 32, cellW = 200;
      const cells = [30, 260, 490];   // 30, 30+200+30=260, 260+200+30=490
      for (const cx of cells) {
        g.fillStyle(0x000000, 0.5);
        g.fillRoundedRect(cx + 2, cellY + 2, cellW, cellH, 12);
        g.fillStyle(0x020108, 1);
        g.fillRoundedRect(cx, cellY, cellW, cellH, 12);
        g.fillStyle(0xffd700, 0.04);
        g.fillRoundedRect(cx + 2, cellY + 2, cellW - 4, 36, { tl: 10, tr: 10, bl: 0, br: 0 });
      }

      // Gold vertical dividers
      g.lineStyle(2.5, 0xffd700, 0.55);
      g.lineBetween(260, 14, 260, h - 14);
      g.lineBetween(490, 14, 490, h - 14);

      // Inner accent border
      g.lineStyle(2, 0xffee44, 0.4);
      g.strokeRoundedRect(8, 8, w - 16, h - 16, 20);

      // Main gold border
      g.lineStyle(5, 0xffd700, 1);
      g.strokeRoundedRect(0, 0, w, h, 28);

      // Outer glow border
      g.lineStyle(2.5, 0xffee44, 0.35);
      g.strokeRoundedRect(-4, -4, w + 8, h + 8, 32);

      // Corner ornaments
      const corners: [number, number][] = [[20, 19], [w-20, 19], [20, h-19], [w-20, h-19]];
      for (const [cx, cy] of corners) {
        g.fillStyle(0xffd700, 1);   g.fillCircle(cx, cy, 7);
        g.fillStyle(0xffee88, 0.7); g.fillCircle(cx, cy, 3.5);
        g.lineStyle(2, 0xffd700, 0.5); g.strokeCircle(cx, cy, 12);
      }

      // Top/bottom center diamond ornaments
      g.fillStyle(0xffd700, 1);
      g.fillTriangle(w/2, 4,  w/2-11, 18, w/2+11, 18);
      g.fillTriangle(w/2, h-4, w/2-11, h-18, w/2+11, h-18);
    });
  }

  private static createSymbols(scene: Phaser.Scene): void {
    const S = 200; // canvas = SYMBOL_SIZE
    const C = 100;

    // ── 3D Card tile ────────────────────────────────────────────────────
    // Uses fillGradientStyle (Phaser rect gradient) + thick gold border + glass dome
    const drawCard3D = (
      g: Phaser.GameObjects.Graphics,
      colTL: number, colTR: number, colBL: number, colBR: number,
    ): void => {
      // Outer drop shadow
      g.fillStyle(0x000000, 0.5);
      g.fillRoundedRect(9, 12, 188, 188, 36);
      // Gradient card body
      g.fillGradientStyle(colTL, colTR, colBL, colBR, 1);
      g.fillRoundedRect(6, 6, 188, 188, 36);
      // Thick gold outer border — 3 layers for depth
      g.lineStyle(10, 0xaa6600, 1);
      g.strokeRoundedRect(6, 6, 188, 188, 36);
      g.lineStyle(7, 0xffd700, 1);
      g.strokeRoundedRect(6, 6, 188, 188, 36);
      g.lineStyle(3, 0xffee88, 0.8);
      g.strokeRoundedRect(12, 12, 176, 176, 30);
      // Glass dome highlight (top half bright, fades down)
      g.fillStyle(0xffffff, 0.28);
      g.fillRoundedRect(14, 14, 172, 80,  { tl: 28, tr: 28, bl: 0, br: 0 });
      g.fillStyle(0xffffff, 0.12);
      g.fillRoundedRect(14, 14, 172, 122, { tl: 28, tr: 28, bl: 0, br: 0 });
      // Bottom edge rim light
      g.fillStyle(0xffffff, 0.06);
      g.fillRoundedRect(14, 157, 172, 37, { tl: 0, tr: 0, bl: 28, br: 28 });
    };

    // ── SEVEN — bakeTextureRich at 2× (400×400 → displayed 200×200) ──────
    bakeTextureRich(scene, ASSETS.SYMBOL_SEVEN, 400, 400, rt => {
      const bg = makeGraphics(scene);
      bg.fillStyle(0x000000, 0.5);
      bg.fillRoundedRect(18, 24, 376, 376, 72);
      bg.fillGradientStyle(0xff2244, 0xdd1133, 0x990022, 0x660011, 1);
      bg.fillRoundedRect(12, 12, 376, 376, 72);
      bg.lineStyle(20, 0x994400, 1); bg.strokeRoundedRect(12, 12, 376, 376, 72);
      bg.lineStyle(14, 0xffd700, 1); bg.strokeRoundedRect(12, 12, 376, 376, 72);
      bg.lineStyle(6,  0xffee88, 0.8); bg.strokeRoundedRect(26, 26, 348, 348, 60);
      bg.fillStyle(0xffffff, 0.30); bg.fillRoundedRect(28, 28, 344, 154, { tl:60, tr:60, bl:0, br:0 });
      bg.fillStyle(0xffffff, 0.13); bg.fillRoundedRect(28, 28, 344, 240, { tl:60, tr:60, bl:0, br:0 });
      rt.draw(bg); bg.destroy();

      const txt = scene.add.text(200, 216, '7', {
        fontFamily: '"Bebas Neue", "Arial Narrow", Impact, sans-serif',
        fontSize:   '300px',
        color:      '#ffd700',
        stroke:     '#cc1133',
        strokeThickness: 26,
        shadow:     { offsetX: 8, offsetY: 11, color: '#1a0000', blur: 28, fill: true },
      }).setOrigin(0.5, 0.5);
      rt.draw(txt); txt.destroy();

      const gems = makeGraphics(scene);
      const jR = (x: number, y: number) => {
        gems.fillStyle(0x220000, 0.6); gems.fillCircle(x+4, y+4, 26);
        gems.fillStyle(0x880022, 1);   gems.fillCircle(x, y, 26);
        gems.fillStyle(0xcc1133, 1);   gems.fillCircle(x-3, y-3, 19);
        gems.fillStyle(0xff5577, 1);   gems.fillCircle(x-7, y-8, 10);
        gems.fillStyle(0xffffff, 0.9); gems.fillCircle(x-10, y-12, 5);
        gems.lineStyle(3, 0xff2244, 0.8); gems.strokeCircle(x, y, 26);
      };
      jR(62,  218);
      jR(338, 218);
      rt.draw(gems); gems.destroy();
    });

    // ── GEM (Diamond) ── 200×200 ────────────────────────────────────────
    bakeTexture(scene, ASSETS.SYMBOL_GEM, S, S, g => {
      drawCard3D(g, 0x004488, 0x003366, 0x001a44, 0x001133);

      // Diamond — brilliant cut (coords scaled to 200×200, C=100)
      const tx = C, ty = 32;
      const lx = 22, rx = 178, gy = 108;
      const bx = C, by = 170;

      // Bottom pavilion (darker — shadow side)
      g.fillStyle(0x002299, 1);
      g.fillTriangle(lx, gy, C, gy, bx, by);
      g.fillStyle(0x003dbf, 1);
      g.fillTriangle(C, gy, rx, gy, bx, by);
      g.fillStyle(0x001166, 0.9);
      g.fillTriangle(C-20, gy+26, C+20, gy+26, bx, by);

      // Upper crown (brighter — lit side)
      g.fillStyle(0x1a66ff, 1);
      g.fillTriangle(tx, ty, lx, gy, C-28, gy-17);
      g.fillStyle(0x3388ff, 1);
      g.fillTriangle(tx, ty, C-28, gy-17, C+28, gy-17);
      g.fillStyle(0x55aaff, 1);
      g.fillTriangle(tx, ty, C+28, gy-17, rx, gy);
      g.fillStyle(0x77ccff, 0.9);
      g.fillTriangle(tx, ty, lx, gy, tx-14, gy-40);

      // Table facet — brightest
      g.fillStyle(0x99ddff, 1);
      g.fillTriangle(tx-28, gy-17, tx+28, gy-17, tx, ty);

      // Facet lines
      g.lineStyle(2, 0x00ccff, 0.7);
      g.lineBetween(lx, gy, rx, gy);
      g.lineBetween(tx, ty, lx, gy);
      g.lineBetween(tx, ty, rx, gy);
      g.lineBetween(lx, gy, bx, by);
      g.lineBetween(rx, gy, bx, by);
      g.lineStyle(1.5, 0x44eeff, 0.4);
      g.lineBetween(tx, ty, bx, by);
      g.lineBetween(C-28, gy-17, lx, gy);
      g.lineBetween(C+28, gy-17, rx, gy);
      g.lineBetween(C, gy, bx, by);

      // Sparkles
      g.fillStyle(0xffffff, 1);   g.fillCircle(tx, ty+1, 7);
      g.fillStyle(0xffffff, 0.9); g.fillCircle(tx, ty+1, 3.5);
      g.fillStyle(0xaaeeff, 0.8); g.fillCircle(lx+12, gy-26, 3.5);
      g.fillStyle(0xaaeeff, 0.8); g.fillCircle(rx-12, gy-26, 3.5);
      g.fillStyle(0xffffff, 0.6); g.fillCircle(C-12, gy-8, 3);
    });

    // ── CROWN — bakeTextureRich at 2× (400×400 → displayed 200×200) ────────
    bakeTextureRich(scene, ASSETS.SYMBOL_CROWN, 400, 400, rt => {
      // ── Card: deep purple-navy so gold crown pops with maximum contrast ──
      const bg = makeGraphics(scene);
      bg.fillStyle(0x000000, 0.55);
      bg.fillRoundedRect(18, 24, 376, 376, 72);
      bg.fillGradientStyle(0x1a0660, 0x0e0340, 0x06011e, 0x02000c, 1);
      bg.fillRoundedRect(12, 12, 376, 376, 72);
      bg.lineStyle(20, 0x994400, 1); bg.strokeRoundedRect(12, 12, 376, 376, 72);
      bg.lineStyle(14, 0xffd700, 1); bg.strokeRoundedRect(12, 12, 376, 376, 72);
      bg.lineStyle(6,  0xffee88, 0.8); bg.strokeRoundedRect(26, 26, 348, 348, 60);
      bg.fillStyle(0xffffff, 0.10); bg.fillRoundedRect(28, 28, 344, 130, { tl:60, tr:60, bl:0, br:0 });
      rt.draw(bg); bg.destroy();

      const g = makeGraphics(scene);

      // ── Warm gold glow ────────────────────────────────────────────────
      g.fillStyle(0xffaa00, 0.18); g.fillEllipse(200, 235, 330, 210);
      g.fillStyle(0xffdd00, 0.10); g.fillEllipse(200, 210, 220, 140);

      // ── Base band ─────────────────────────────────────────────────────
      g.fillStyle(0x000000, 0.55); g.fillRoundedRect(46, 282, 316, 78, 18); // shadow
      g.fillStyle(0x664400, 1);    g.fillRoundedRect(40, 276, 320, 76, 18); // extrusion
      g.fillGradientStyle(0xffee55, 0xffd700, 0xcc9900, 0xaa7700, 1);
      g.fillRoundedRect(40, 266, 320, 74, 18);
      g.fillStyle(0xffffff, 0.35); g.fillRoundedRect(40, 266, 320, 24, { tl:18, tr:18, bl:0, br:0 });
      g.lineStyle(5, 0xffcc00, 1); g.strokeRoundedRect(40, 266, 320, 74, 18);
      g.lineStyle(2, 0xffee88, 0.55); g.strokeRoundedRect(50, 276, 300, 54, 12);

      // ── Peak drawer — proper 3D with solid-color layers (no gradient on triangles) ──
      const peak = (bx: number, by: number, bw: number, tx: number, ty: number) => {
        const bx2 = bx + bw;
        const midX = (bx + bx2) / 2;
        // Shadow
        g.fillStyle(0x000000, 0.6);
        g.fillTriangle(bx + 6, by + 7, bx2 + 6, by + 7, tx + 5, ty + 7);
        // Dark back extrusion
        g.fillStyle(0x442200, 1);
        g.fillTriangle(bx, by, bx2, by, tx + 3, ty + 5);
        // Main body — medium gold
        g.fillStyle(0xcc9900, 1);
        g.fillTriangle(bx, by, bx2, by, tx, ty);
        // LEFT face — bright lit side
        g.fillStyle(0xffee44, 0.9);
        g.fillTriangle(bx, by, tx, ty, midX - bw * 0.08, by);
        // RIGHT face — shadow side
        g.fillStyle(0x7a5500, 0.75);
        g.fillTriangle(bx2, by, tx, ty, midX + bw * 0.08, by);
        // Centre highlight streak
        g.fillStyle(0xffffff, 0.22);
        g.fillTriangle(tx - 5, ty + 24, tx + 5, ty + 24, tx, ty);
        // Gold outline
        g.lineStyle(4, 0xffd700, 1);
        g.beginPath(); g.moveTo(bx, by); g.lineTo(tx, ty); g.lineTo(bx2, by); g.strokePath();
        // Tip gem — 3D orb
        g.fillStyle(0x000000, 0.5);  g.fillCircle(tx + 3, ty + 3, 15);
        g.fillStyle(0xbb8800, 1);    g.fillCircle(tx, ty, 15);
        g.fillStyle(0xffd700, 1);    g.fillCircle(tx - 2, ty - 3, 11);
        g.fillStyle(0xffee88, 1);    g.fillCircle(tx - 4, ty - 6, 6);
        g.fillStyle(0xffffff, 0.9);  g.fillCircle(tx - 6, ty - 8, 3);
        g.lineStyle(2.5, 0xffaa00, 0.9); g.strokeCircle(tx, ty, 15);
      };

      // 5 peaks — outer shorter, inner taller, centre tallest
      peak(40,  266,  58,  69,  184);   // far left
      peak(103, 266,  74, 140,  126);   // left
      peak(162, 266,  76, 200,   68);   // CENTRE (tallest)
      peak(222, 266,  74, 260,  126);   // right
      peak(302, 266,  58, 331,  184);   // far right

      // ── Jewels on band ────────────────────────────────────────────────
      const jw = (x: number, y: number, r: number, c1: number, c2: number, c3: number) => {
        g.fillStyle(0x000000, 0.5);  g.fillCircle(x + r*0.2, y + r*0.2, r);
        g.fillStyle(c1, 1);          g.fillCircle(x, y, r);
        g.fillStyle(c2, 1);          g.fillCircle(x - r*0.12, y - r*0.12, r*0.68);
        g.fillStyle(c3, 1);          g.fillCircle(x - r*0.28, y - r*0.32, r*0.32);
        g.fillStyle(0xffffff, 0.9);  g.fillCircle(x - r*0.42, y - r*0.46, r*0.14);
        g.lineStyle(3, c1, 0.85);    g.strokeCircle(x, y, r);
      };

      jw(200, 308, 28, 0x880022, 0xcc1133, 0xff5577);  // ruby
      jw(118, 308, 21, 0x003388, 0x1155dd, 0x55aaff);  // sapphire L
      jw(282, 308, 21, 0x003388, 0x1155dd, 0x55aaff);  // sapphire R
      jw(158, 310, 14, 0x006622, 0x118833, 0x44cc66);  // emerald L
      jw(242, 310, 14, 0x006622, 0x118833, 0x44cc66);  // emerald R

      rt.draw(g); g.destroy();
    });

    // ── COIN — bakeTextureRich at 2× for crisp $ sign (400×400 coords) ─────
    bakeTextureRich(scene, ASSETS.SYMBOL_COIN, 400, 400, rt => {
      // Card background (400×400 coords, matches SEVEN style)
      const bg = makeGraphics(scene);
      bg.fillStyle(0x000000, 0.5);
      bg.fillRoundedRect(18, 24, 376, 376, 72);
      bg.fillGradientStyle(0xcc7700, 0xaa5500, 0x663300, 0x442200, 1);
      bg.fillRoundedRect(12, 12, 376, 376, 72);
      bg.lineStyle(20, 0x994400, 1); bg.strokeRoundedRect(12, 12, 376, 376, 72);
      bg.lineStyle(14, 0xffd700, 1); bg.strokeRoundedRect(12, 12, 376, 376, 72);
      bg.lineStyle(6,  0xffee88, 0.8); bg.strokeRoundedRect(26, 26, 348, 348, 60);
      bg.fillStyle(0xffffff, 0.30); bg.fillRoundedRect(28, 28, 344, 154, { tl:60, tr:60, bl:0, br:0 });
      bg.fillStyle(0xffffff, 0.13); bg.fillRoundedRect(28, 28, 344, 240, { tl:60, tr:60, bl:0, br:0 });
      rt.draw(bg); bg.destroy();

      // 3D coin sphere (center scaled to 200,206 from 140,144)
      const coin = makeGraphics(scene);
      const cx = 200, cy = 206;
      coin.fillStyle(0x000000, 0.4);   coin.fillEllipse(cx+14, cy+20, 251, 51);  // shadow
      coin.fillStyle(0x331100, 1);     coin.fillCircle(cx, cy, 137);
      coin.fillStyle(0x885500, 1);     coin.fillCircle(cx, cy, 129);
      coin.fillStyle(0xffaa00, 1);     coin.fillCircle(cx, cy, 120);
      coin.fillStyle(0xcc7700, 1);     coin.fillCircle(cx, cy, 109);
      coin.fillStyle(0xffcc00, 1);     coin.fillCircle(cx, cy, 97);
      coin.fillGradientStyle(0xffee88, 0xffd700, 0xffaa00, 0xcc8800, 1);
      coin.fillCircle(cx, cy, 80);
      coin.lineStyle(7, 0x886600, 0.8); coin.strokeCircle(cx, cy, 109);
      coin.lineStyle(4, 0xffee44, 0.5); coin.strokeCircle(cx, cy, 120);
      rt.draw(coin); coin.destroy();

      // "$" — crisp font at 2× size, centered on coin
      const dollar = scene.add.text(cx, cy - 3, '$', {
        fontFamily: '"Bebas Neue", "Arial Narrow", Impact, sans-serif',
        fontSize:   '172px',
        color:      '#fff8cc',
        stroke:     '#884400',
        strokeThickness: 12,
        shadow:     { offsetX: 5, offsetY: 6, color: '#1a0800', blur: 14, fill: true },
      }).setOrigin(0.5, 0.5);
      rt.draw(dollar); dollar.destroy();

      // Specular highlight on coin
      const sh = makeGraphics(scene);
      sh.fillStyle(0xffffff, 0.55); sh.fillEllipse(cx-40, cy-51, 80, 43);
      sh.fillStyle(0xffffff, 0.25); sh.fillEllipse(cx-26, cy-37, 111, 63);
      rt.draw(sh); sh.destroy();
    });
  }

  // ── OLD createSymbols replaced — keeping stub so TS doesn't complain ──
  private static _oldSymbolsPlaceholder(scene: Phaser.Scene): void {
    // ── SEVEN (Lucky 7) [OLD — no longer used] ───────────────────────────
    bakeTexture(scene, '__unused_seven', 120, 120, g => {
      // Deep dark background
      g.fillStyle(0x080010, 1);
      g.fillRoundedRect(5, 5, 110, 110, 16);

      // Red glow aura behind the 7
      g.fillStyle(0xdd1100, 0.18);
      g.fillCircle(60, 68, 50);

      // Shadow of "7"
      g.fillStyle(0x440000, 0.7);
      g.fillRect(24, 22, 74, 16);
      g.fillTriangle(74, 38, 92, 38, 57, 100);
      g.fillTriangle(74, 38, 57, 100, 40, 100);

      // Main "7" shape in gold
      g.fillStyle(0xffd700, 1);
      g.fillRect(22, 20, 74, 16);
      g.fillTriangle(72, 36, 90, 36, 55, 98);
      g.fillTriangle(72, 36, 55, 98, 38, 98);

      // Highlight on top bar
      g.fillStyle(0xffee88, 0.65);
      g.fillRect(22, 20, 74, 6);

      // Small highlight triangle on downstroke
      g.fillStyle(0xffee88, 0.4);
      g.fillTriangle(72, 36, 90, 36, 75, 52);

      // Gold border on "7"
      g.lineStyle(2, 0xffaa00, 0.6);
      g.strokeRect(22, 20, 74, 16);

      // Red star gems flanking the 7
      g.fillStyle(0xff2244, 1);
      g.fillCircle(22, 55, 5);
      g.fillCircle(98, 55, 5);
      g.fillStyle(0xff8899, 0.6);
      g.fillCircle(20, 53, 2);
      g.fillCircle(96, 53, 2);
    });

    // ── GEM (Diamond) ────────────────────────────────────────────────────
    bakeTexture(scene, ASSETS.SYMBOL_GEM, 120, 120, g => {
      // Deep navy background
      g.fillStyle(0x020a18, 1);
      g.fillRoundedRect(5, 5, 110, 110, 16);

      // Cyan glow aura
      g.fillStyle(0x0088cc, 0.15);
      g.fillCircle(60, 65, 48);

      // Diamond shadow
      g.fillStyle(0x002244, 0.6);
      g.fillTriangle(63, 22, 113, 62, 63, 108);
      g.fillTriangle(63, 62, 113, 62, 63, 108);

      // Diamond facets (kite/brilliant cut)
      g.fillStyle(0x0088ff, 1);
      g.fillTriangle(60, 20, 10, 62, 60, 106);

      g.fillStyle(0x00aaff, 1);
      g.fillTriangle(60, 20, 110, 62, 60, 106);

      g.fillStyle(0x44ccff, 0.6);
      g.fillTriangle(60, 20, 10, 62, 60, 62);

      g.fillStyle(0x88ddff, 0.5);
      g.fillTriangle(60, 20, 110, 62, 60, 62);

      g.fillStyle(0x44ccff, 0.35);
      g.fillTriangle(10, 62, 110, 62, 60, 78);

      g.fillStyle(0xffffff, 0.8);
      g.fillTriangle(60, 20, 44, 48, 60, 44);

      g.lineStyle(1.5, 0x00eeff, 0.6);
      g.lineBetween(10, 62, 60, 20);
      g.lineBetween(110, 62, 60, 20);
      g.lineBetween(10, 62, 60, 106);
      g.lineBetween(110, 62, 60, 106);
      g.lineBetween(10, 62, 110, 62);
      g.lineStyle(1, 0x00eeff, 0.3);
      g.lineBetween(60, 20, 60, 106);

      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(60, 22, 3);
      g.fillStyle(0xaaeeff, 0.5);
      g.fillCircle(30, 50, 1.5);
      g.fillCircle(90, 50, 1.5);
    });

    // ── CROWN ────────────────────────────────────────────────────────────
    bakeTexture(scene, ASSETS.SYMBOL_CROWN, 120, 120, g => {
      g.fillStyle(0x0a0600, 1);
      g.fillRoundedRect(5, 5, 110, 110, 16);

      g.fillStyle(0xffd700, 0.12);
      g.fillCircle(60, 68, 48);

      g.fillStyle(0x554400, 0.6);
      g.fillRect(17, 77, 88, 24);

      g.fillStyle(0xcc9900, 1);
      g.fillRect(16, 76, 88, 22);
      g.fillStyle(0xffd700, 1);
      g.fillRect(16, 76, 88, 14);

      g.fillStyle(0x554400, 0.5);
      g.fillTriangle(55, 23, 65, 23, 60, 44);
      g.fillRect(55, 42, 10, 36);
      g.fillTriangle(28, 33, 37, 33, 33, 50);
      g.fillRect(28, 48, 9, 28);
      g.fillTriangle(83, 33, 92, 33, 88, 50);
      g.fillRect(83, 48, 9, 28);

      g.fillStyle(0xffd700, 1);
      g.fillTriangle(16, 57, 22, 57, 19, 68);
      g.fillRect(16, 65, 6, 12);
      g.fillTriangle(26, 34, 36, 34, 31, 50);
      g.fillRect(26, 48, 10, 28);
      g.fillTriangle(53, 21, 67, 21, 60, 42);
      g.fillRect(54, 40, 12, 36);
      g.fillTriangle(84, 34, 94, 34, 89, 50);
      g.fillRect(84, 48, 10, 28);
      g.fillTriangle(98, 57, 104, 57, 101, 68);
      g.fillRect(98, 65, 6, 12);

      g.fillStyle(0xffee88, 0.5);
      g.fillRect(54, 40, 12, 5);
      g.fillRect(26, 48, 10, 5);
      g.fillRect(84, 48, 10, 5);

      g.fillStyle(0xcc1133, 1);
      g.fillCircle(60, 62, 9);
      g.fillStyle(0xff4466, 0.5);
      g.fillCircle(57, 59, 4);
      g.fillStyle(0xffffff, 0.4);
      g.fillCircle(56, 58, 2);
      g.fillStyle(0x1155dd, 1);
      g.fillCircle(32, 66, 6);
      g.fillStyle(0x4488ff, 0.5);
      g.fillCircle(30, 64, 3);
      g.fillStyle(0x1155dd, 1);
      g.fillCircle(88, 66, 6);
      g.fillStyle(0x4488ff, 0.5);
      g.fillCircle(86, 64, 3);

      g.fillStyle(0xffee44, 0.35);
      g.fillRect(16, 76, 88, 5);
    });

    // ── COIN ─────────────────────────────────────────────────────────────
    bakeTexture(scene, ASSETS.SYMBOL_COIN, 120, 120, g => {
      g.fillStyle(0x080600, 1);
      g.fillRoundedRect(5, 5, 110, 110, 16);

      g.fillStyle(0xffd700, 0.14);
      g.fillCircle(60, 60, 48);

      g.fillStyle(0x443300, 0.7);
      g.fillCircle(63, 63, 44);

      g.fillStyle(0xaa7700, 1);
      g.fillCircle(60, 60, 44);

      g.fillStyle(0xffd700, 1);
      g.fillCircle(60, 60, 40);

      g.fillStyle(0xcc9900, 1);
      g.fillCircle(60, 60, 34);

      g.fillStyle(0xffd700, 1);
      g.fillCircle(60, 60, 30);

      g.fillStyle(0xcc9900, 1);
      for (let a = 0; a < 8; a++) {
        const angle = (a * 45) * Math.PI / 180;
        const x1 = 60 + Math.cos(angle) * 30;
        const y1 = 60 + Math.sin(angle) * 30;
        const x2 = 60 + Math.cos(angle + 0.25) * 18;
        const y2 = 60 + Math.sin(angle + 0.25) * 18;
        const x3 = 60 + Math.cos(angle - 0.25) * 18;
        const y3 = 60 + Math.sin(angle - 0.25) * 18;
        g.fillTriangle(x1, y1, x2, y2, x3, y3);
      }

      g.fillStyle(0xffd700, 1);
      g.fillCircle(60, 60, 10);
      g.fillStyle(0xffee88, 0.6);
      g.fillCircle(58, 58, 4);

      g.fillStyle(0xffee88, 0.45);
      g.fillEllipse(46, 40, 20, 14);
      g.lineStyle(3, 0xffee44, 0.5);
      g.strokeCircle(60, 60, 40);
      g.lineStyle(1.5, 0xaa7700, 0.4);
      g.strokeCircle(60, 60, 34);
    });
  } // end _oldSymbolsPlaceholder

  private static createParticle(scene: Phaser.Scene): void {
    bakeTexture(scene, ASSETS.PARTICLE, 20, 20, g => {
      g.fillStyle(0xffd700, 0.3);
      g.fillCircle(10, 10, 10);
      g.fillStyle(0xffd700, 0.7);
      g.fillCircle(10, 10, 7);
      g.fillStyle(0xffee88, 1);
      g.fillCircle(10, 10, 4);
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(10, 10, 2);
    });
  }

  private static createWinBanner(scene: Phaser.Scene): void {
    bakeTexture(scene, ASSETS.WIN_BANNER, 860, 160, g => {
      const w = 860, h = 160;

      g.fillStyle(0x000000, 0.65);
      g.fillRoundedRect(6, 8, w, h, 28);

      g.fillStyle(0xffd700, 0.2);
      g.fillRoundedRect(-4, -4, w + 8, h + 8, 32);

      g.fillStyle(0xaa6600, 1);
      g.fillRoundedRect(0, 0, w, h, 26);
      g.fillStyle(0xffd700, 1);
      g.fillRoundedRect(0, 0, w, h * 0.55, { tl: 26, tr: 26, bl: 0, br: 0 });
      g.fillStyle(0xffaa00, 1);
      g.fillRoundedRect(0, h * 0.45, w, h * 0.55, { tl: 0, tr: 0, bl: 26, br: 26 });
      g.fillStyle(0xffd700, 0.5);
      g.fillRect(0, h * 0.42, w, h * 0.16);

      g.lineStyle(4, 0xffffff, 0.9);
      g.strokeRoundedRect(0, 0, w, h, 26);

      g.lineStyle(2, 0xffee44, 0.6);
      g.strokeRoundedRect(7, 7, w - 14, h - 14, 20);

      const corners: [number, number][] = [[18, 18], [w - 18, 18], [18, h - 18], [w - 18, h - 18]];
      for (const [cx, cy] of corners) {
        g.fillStyle(0xffffff, 0.9);
        g.fillCircle(cx, cy, 5);
        g.fillStyle(0xffd700, 1);
        g.fillCircle(cx, cy, 3);
      }

      g.lineStyle(1.5, 0xffffff, 0.4);
      g.lineBetween(50, h / 2, w / 2 - 90, h / 2);
      g.lineBetween(w / 2 + 90, h / 2, w - 50, h / 2);
    });
  }

  private static createLogo(scene: Phaser.Scene): void {
    bakeTexture(scene, ASSETS.LOGO, 360, 80, g => {
      const w = 360, h = 80;
      g.fillStyle(0x000000, 0.5);
      g.fillRoundedRect(4, 4, w - 4, h - 4, 16);
      g.fillStyle(0x0d0530, 1);
      g.fillRoundedRect(0, 0, w, h, 16);
      g.lineStyle(3, 0xffd700, 1);
      g.strokeRoundedRect(0, 0, w, h, 16);
      g.lineStyle(1, 0xffee44, 0.4);
      g.strokeRoundedRect(5, 5, w - 10, h - 10, 12);
    });
  }

  private static createBottomPanel(scene: Phaser.Scene): void {
    const W = 1920, H = 140;
    bakeTexture(scene, 'bottom_panel', W, H, g => {
      g.fillStyle(0x000000, 0.5);
      g.fillRect(0, 4, W, H - 4);

      g.fillStyle(0x060220, 1);
      g.fillRect(0, 0, W, H);

      g.lineStyle(3, 0xffd700, 1);
      g.lineBetween(0, 1, W, 1);
      g.lineStyle(1, 0xffee44, 0.35);
      g.lineBetween(0, 5, W, 5);

      g.lineStyle(2, 0xffd700, 0.5);
      g.lineBetween(0, H - 5, W, H - 5);

      // Left decorative arrows
      g.fillStyle(0xffd700, 0.7);
      g.fillTriangle(50,  H/2, 86,  H/2-18, 86,  H/2+18);
      g.fillStyle(0xffd700, 0.4);
      g.fillTriangle(20,  H/2, 66,  H/2-14, 66,  H/2+14);
      // Right decorative arrows
      g.fillStyle(0xffd700, 0.7);
      g.fillTriangle(W-50, H/2, W-86, H/2-18, W-86, H/2+18);
      g.fillStyle(0xffd700, 0.4);
      g.fillTriangle(W-20, H/2, W-66, H/2-14, W-66, H/2+14);

      // Vertical dividers (thirds)
      g.lineStyle(1, 0xffd700, 0.2);
      g.lineBetween(W/3,   10, W/3,   H-10);
      g.lineBetween(W*2/3, 10, W*2/3, H-10);
    });
  }
}
