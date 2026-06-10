import Phaser from 'phaser';
import { ASSETS } from '@/types/constants';
import { useSoundManager, SoundManagerLogic } from './use-sound-manager';
import { ProceduralSounds } from '@/utils/ProceduralSounds';

const PROCEDURAL_MAP: Record<string, () => void> = {
  [ASSETS.SFX_CLICK]: () => ProceduralSounds.click(),
  [ASSETS.SFX_SPIN]:  () => ProceduralSounds.spin(),
  [ASSETS.SFX_STOP]:  () => ProceduralSounds.stop(),
  [ASSETS.SFX_WIN]:   () => ProceduralSounds.win(),
};

export class SoundManagerComponent {
  private readonly scene: Phaser.Scene;
  private readonly logic: SoundManagerLogic;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.logic = useSoundManager();
  }

  /** Start background music loop (Web Audio API procedural) */
  init(): void {
    if (this.logic.isEnabled()) {
      ProceduralSounds.startBgMusic();
    }
  }

  play(key: string): void {
    if (!this.logic.isEnabled()) return;
    if (PROCEDURAL_MAP[key]) {
      PROCEDURAL_MAP[key]();
    }
  }

  /** Toggle all sound on/off. Returns new enabled state. */
  toggle(): boolean {
    const enabled = this.logic.toggle();
    if (enabled) {
      ProceduralSounds.unmute();
    } else {
      ProceduralSounds.mute();
      ProceduralSounds.stopBgMusic();
    }
    return enabled;
  }

  isEnabled(): boolean {
    return this.logic.isEnabled();
  }

  destroy(): void {
    ProceduralSounds.stopBgMusic();
  }
}
