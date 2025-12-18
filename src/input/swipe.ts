import type { HandsFrame } from "./hands";
import { CONFIG } from "../core/config";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function palmCenterX(frame: HandsFrame): number | null {
  if (!frame.hasHand || !frame.landmarks) return null;
  const lm = frame.landmarks;
  if (lm.length < 21) return null;

  // Palm points: wrist + MCP joints.
  const indices = [0, 5, 9, 13, 17] as const;
  let sum = 0;
  for (const i of indices) sum += lm[i].x;
  return sum / indices.length;
}

export interface SwipeEvent {
  velocityX: number; // normalized units / second
  deltaSpinVelocity: number; // additive change to spin velocity
}

export interface SwipeDetector {
  update(frame: HandsFrame, nowMs: number): SwipeEvent | null;
  reset(): void;
}

export function createSwipeDetector(): SwipeDetector {
  let prevX: number | null = null;
  let prevT: number | null = null;
  let lastTriggerAtMs = 0;
  let lastTriggerX: number | null = null;

  function reset() {
    prevX = null;
    prevT = null;
    lastTriggerAtMs = 0;
    lastTriggerX = null;
  }

  function update(frame: HandsFrame, nowMs: number): SwipeEvent | null {
    const x = palmCenterX(frame);
    if (x == null) {
      prevX = null;
      prevT = null;
      return null;
    }

    if (prevX == null || prevT == null) {
      prevX = x;
      prevT = nowMs;
      return null;
    }

    const dt = (nowMs - prevT) / 1000;
    prevT = nowMs;
    if (dt <= 1e-3) {
      prevX = x;
      return null;
    }

    const vx = (x - prevX) / dt;
    prevX = x;

    if (nowMs - lastTriggerAtMs < CONFIG.swipe.cooldownMs) return null;
    if (Math.abs(vx) < CONFIG.swipe.velocityThreshold) return null;

    if (lastTriggerX != null && Math.abs(x - lastTriggerX) < CONFIG.swipe.minTravel) return null;

    // vx > 0 => moving right in camera coordinates => speed up
    // vx < 0 => moving left => slow down
    const delta = clamp(vx * CONFIG.swipe.impulseScale, -1.2, 1.2);
    if (Math.abs(delta) < 0.05) return null;

    lastTriggerAtMs = nowMs;
    lastTriggerX = x;

    return {
      velocityX: vx,
      deltaSpinVelocity: delta
    };
  }

  return { update, reset };
}

