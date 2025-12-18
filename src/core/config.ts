export const CONFIG = {
  maxDevicePixelRatio: 1.5,
  pinch: {
    minNormalizedDistance: 0.2,
    maxNormalizedDistance: 0.7
  },
  openPalm: {
    cooldownMs: 600
  },
  swipe: {
    cooldownMs: 300,
    velocityThreshold: 0.85,
    minTravel: 0.06,
    impulseScale: 0.65
  },
  handLost: {
    decayDelayMs: 1200,
    decayPerSecond: 0.35
  }
} as const;
