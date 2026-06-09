export enum AnimDuration {
  Instant   = 0.08,
  Fast      = 0.1,
  Normal    = 0.15,
  Medium    = 0.2,
  Slow      = 0.3,
  SlowFade  = 0.4,
  Entrance  = 0.65,
  FadeIn    = 0.5,
  CameraFade = 500,   // ms (Phaser tweens)
  SceneIntro = 400,   // ms
}

export enum AnimEase {
  Linear      = 'none',
  In          = 'power2.in',
  Out         = 'power2.out',
  InOut       = 'power2.inOut',
  BackOut     = 'back.out(1.5)',
  BackOutHard = 'back.out(2)',
  SineInOut   = 'Sine.easeInOut',
  SineOut     = 'sine.out',
  SineIn      = 'sine.in',
}
