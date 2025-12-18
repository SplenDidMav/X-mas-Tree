export const CONFIG = {
  maxDevicePixelRatio: 1.5,
  pinch: {
    minNormalizedDistance: 0.2,
    maxNormalizedDistance: 0.7
  },
  handLost: {
    decayDelayMs: 1200,
    decayPerSecond: 0.35
  }
} as const;
