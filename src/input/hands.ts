import { Hands, type Results } from "@mediapipe/hands";
import type { InputController, InputLifecycle } from "./types";

export type HandsStatus = "not-started" | "loading" | "tracking" | "lost" | "error";

export interface HandsFrame {
  hasHand: boolean;
  handedness: "Right" | "Left" | "Unknown";
  landmarks: Results["multiHandLandmarks"][number] | null;
}

export interface HandsController extends InputController {
  getStatus(): InputLifecycle;
  getHandsStatus(): HandsStatus;
  getLastFrame(): HandsFrame | null;
  startTracking(): Promise<void>;
  stopTracking(): void;
}

export interface HandsOptions {
  video: HTMLVideoElement;
  locateFileBaseUrl?: string;
  onStatusChange?: (status: HandsStatus) => void;
  onFrame?: (frame: HandsFrame) => void;
  onError?: (error: unknown) => void;
}

function pickRightHand(results: Results): HandsFrame {
  const landmarks = results.multiHandLandmarks ?? [];
  const handedness = results.multiHandedness ?? [];

  if (landmarks.length === 0) {
    return { hasHand: false, handedness: "Unknown", landmarks: null };
  }

  let rightIndex = -1;
  for (let i = 0; i < handedness.length; i++) {
    const label = handedness[i]?.label;
    if (label === "Right") {
      rightIndex = i;
      break;
    }
  }

  const chosenIndex = rightIndex >= 0 ? rightIndex : 0;
  const chosenLabel = handedness[chosenIndex]?.label;

  return {
    hasHand: true,
    handedness: chosenLabel === "Right" ? "Right" : chosenLabel === "Left" ? "Left" : "Unknown",
    landmarks: landmarks[chosenIndex] ?? null
  };
}

export function createHandsController(opts: HandsOptions): HandsController {
  let lifecycle: InputLifecycle = "stopped";
  let handsStatus: HandsStatus = "not-started";
  let lastFrame: HandsFrame | null = null;

  let hands: Hands | null = null;
  let rafId = 0;
  let tracking = false;

  function setStatus(next: HandsStatus) {
    handsStatus = next;
    opts.onStatusChange?.(next);
  }

  async function ensureHandsLoaded() {
    if (hands) return;
    setStatus("loading");

    const base = opts.locateFileBaseUrl ?? "/mediapipe/hands";
    hands = new Hands({
      locateFile: (file) => `${base}/${file}`
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6
    });

    hands.onResults((results: Results) => {
      const frame = pickRightHand(results);
      lastFrame = frame;
      setStatus(frame.hasHand ? "tracking" : "lost");
      opts.onFrame?.(frame);
    });

    // After configuration, mark as ready but not yet tracking.
    setStatus("lost");
  }

  async function tick() {
    if (!tracking || !hands) return;

    try {
      const { video } = opts;
      if (video.readyState >= 2) {
        await hands.send({ image: video });
      }
    } catch (error) {
      setStatus("error");
      opts.onError?.(error);
      return;
    }

    rafId = window.requestAnimationFrame(() => {
      void tick();
    });
  }

  async function startTracking() {
    if (lifecycle === "disposed") return;
    if (tracking) return;

    tracking = true;
    await ensureHandsLoaded();
    rafId = window.requestAnimationFrame(() => {
      void tick();
    });
  }

  function stopTracking() {
    tracking = false;
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = 0;
    if (handsStatus !== "not-started") setStatus("lost");
  }

  function start() {
    if (lifecycle === "disposed") return;
    if (lifecycle === "started") return;
    lifecycle = "started";
  }

  function stop() {
    if (lifecycle !== "started") return;
    lifecycle = "stopped";
    stopTracking();
  }

  function dispose() {
    if (lifecycle === "disposed") return;
    stop();
    lifecycle = "disposed";
    hands?.close();
    hands = null;
    setStatus("not-started");
  }

  return {
    start,
    stop,
    dispose,
    getStatus: () => lifecycle,
    getHandsStatus: () => handsStatus,
    getLastFrame: () => lastFrame,
    startTracking,
    stopTracking
  };
}

