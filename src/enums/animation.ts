export enum AnimDuration {
  Fast      = 0.1,
  Normal    = 0.15,
  Medium    = 0.2,
  Slow      = 0.3,
  SlowFade  = 0.4,
  Entrance  = 0.65,
  CameraFade = 500,   // ms (Phaser tweens)
  SceneIntro = 400,   // ms
}

export enum AnimEase {
  In          = 'power2.in',
  Out         = 'power2.out',
  BackOut     = 'back.out(1.5)',
  BackOutHard = 'back.out(2)',
  SineInOut   = 'Sine.easeInOut',
  SineIn      = 'sine.in',
}
