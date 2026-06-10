export function useSoundManager() {
  let enabled = true;

  return {
    isEnabled: () => enabled,
    toggle: () => {
      enabled = !enabled;
      return enabled;
    },
  };
}

export type SoundManagerLogic = ReturnType<typeof useSoundManager>;
