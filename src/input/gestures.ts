import type { HandsFrame } from "./hands";
import { CONFIG } from "../core/config";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Returns pinch strength in [0..1], where 1 means fingers are close (pinching).
 * Uses camera-space normalized coordinates from MediaPipe (0..1-ish).
 */
export function computePinchStrength(frame: HandsFrame): number | null {
  if (!frame.hasHand || !frame.landmarks) return null;
  const lm = frame.landmarks;
  if (lm.length < 21) return null;

  const thumbTip = lm[4];
  const indexTip = lm[8];
  const wrist = lm[0];
  const middleMcp = lm[9];

  const pinchDist = distance(thumbTip, indexTip);
  const handScale = Math.max(1e-6, distance(wrist, middleMcp));
  const normalized = pinchDist / handScale;

  const minD = CONFIG.pinch.minNormalizedDistance;
  const maxD = CONFIG.pinch.maxNormalizedDistance;

  // normalized <= minD => strong pinch (1), normalized >= maxD => open (0)
  const t = (normalized - minD) / Math.max(1e-6, maxD - minD);
  return clamp(1 - t, 0, 1);
}

