import { SPINE_ANIMS } from '@/types/constants';

export function useSpineCharacter() {
  let currentAnim = '';

  return {
    getCurrentAnim: () => currentAnim,
    shouldPlay: (animName: string) => currentAnim !== animName,
    setCurrentAnim: (anim: string) => { currentAnim = anim; },
    getIdleAnim: () => SPINE_ANIMS.IDLE,
    getWinAnim: () => SPINE_ANIMS.WIN,
    getSpinAnim: () => SPINE_ANIMS.SPIN,
  };
}
