import Phaser from 'phaser';
import { PhaserColor, CssColor } from '../enums/colors';
import { FontFamily, FontSize } from '../enums/fonts';
import { UiBox } from '../enums/ui-layout';

/**
 * Draws a rounded UI info-box (balance / bet panel) onto a Graphics object.
 */
export function drawInfoBox(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  w: number = UiBox.Width,
  h: number = UiBox.Height,
  r: number = UiBox.Radius,
): void {
  // Drop shadow
  g.fillStyle(PhaserColor.Black, 0.5);
  g.fillRoundedRect(cx - w / 2 + 3, cy - h / 2 + 4, w, h, r);

  // Dark body
  g.fillStyle(0x06021a, UiBox.FillAlpha);
  g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, r);

  // Top inner highlight (subtle sheen)
  g.fillStyle(PhaserColor.White, 0.05);
  g.fillRoundedRect(cx - w / 2 + 2, cy - h / 2 + 2, w - 4, h * 0.42, { tl: r - 2, tr: r - 2, bl: 0, br: 0 });

  // Outer gold border
  g.lineStyle(UiBox.BorderWidth, PhaserColor.Gold, UiBox.BorderAlpha);
  g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, r);

  // Inner accent line (thinner, brighter)
  g.lineStyle(1, 0xffee44, 0.3);
  g.strokeRoundedRect(cx - w / 2 + 3, cy - h / 2 + 3, w - 6, h - 6, r - 2);
}

/**
 * Adds a label + value pair to a scene (e.g. "BALANCE" / "$1000").
 * Returns the value Text object so it can be updated later.
 */
export function addLabelValue(
  scene: Phaser.Scene,
  cx: number,
  cy: number,
  label: string,
  value: string,
  valueColor: string = CssColor.Gold,
): Phaser.GameObjects.Text {
  scene.add.text(cx, cy - 12, label, {
    fontFamily: FontFamily.Label,
    fontSize:   FontSize.Xs,
    color:      CssColor.LavenderUI,
    letterSpacing: 2,
  }).setOrigin(0.5, 0.5);

  return scene.add.text(cx, cy + 14, value, {
    fontFamily: FontFamily.Heading,
    fontSize:   FontSize.Xl,
    color:      valueColor,
  }).setOrigin(0.5, 0.5);
}

/**
 * Makes a Phaser Graphics object using scene.make without adding to display list.
 */
export function makeGraphics(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  // @ts-ignore — Phaser types omit the `add` config key but it works at runtime
  return scene.make.graphics({ x: 0, y: 0, add: false });
}

/**
 * Creates a render-texture, draws a Graphics object into it, saves as a texture key,
 * then destroys both temporary objects.
 */
export function bakeTexture(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  draw: (g: Phaser.GameObjects.Graphics) => void,
): void {
  const rt = scene.add.renderTexture(0, 0, w, h).setVisible(false);
  const g  = makeGraphics(scene);
  draw(g);
  rt.draw(g, 0, 0);
  rt.saveTexture(key);
  g.destroy();
  rt.destroy();
}

/**
 * Rich version of bakeTexture — gives direct access to the RenderTexture
 * so you can draw Graphics, Text, Images, or any Game Object into it.
 * Manage object lifecycles (create + destroy) inside the callback.
 */
export function bakeTextureRich(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  draw: (rt: Phaser.GameObjects.RenderTexture) => void,
): void {
  const rt = scene.add.renderTexture(0, 0, w, h).setVisible(false);
  draw(rt);
  rt.saveTexture(key);
  rt.destroy();
}
