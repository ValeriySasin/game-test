/** GSAP durations — seconds */
export enum AnimDuration {
  Fast      = 0.1,
  Normal    = 0.15,
  Medium    = 0.2,
  Slow      = 0.3,
  SlowFade  = 0.4,
  Entrance  = 0.65,
}

/** Phaser durations — milliseconds */
export enum AnimDurationMs {
  SceneIntro      = 400,
  CameraFade      = 500,
  SpinResultPause = 550,  // pause after reels stop before showing win banner
}

export enum AnimEase {
  In          = 'power2.in',
  Out         = 'power2.out',
  BackOut     = 'back.out(1.5)',
  BackOutHard = 'back.out(2)',
  SineInOut   = 'Sine.easeInOut',
  SineIn      = 'sine.in',
  SineOut     = 'sine.out',
}
