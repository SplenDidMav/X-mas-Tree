export type GameMode = "TREE" | "TRANSFORM" | "TORNADO" | "PAUSE";

export interface GameState {
  mode: GameMode;
  transformProgress: number;
  spinVelocity: number;
}

export interface GameIntent {
  transformProgress?: number;
  spinVelocity?: number;
  togglePause?: boolean;
}

export function createInitialState(): GameState {
  return {
    mode: "TREE",
    transformProgress: 0,
    spinVelocity: 0.5
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function applyIntent(prev: GameState, intent: GameIntent): GameState {
  const nextProgress =
    intent.transformProgress === undefined
      ? prev.transformProgress
      : clamp(intent.transformProgress, 0, 1);
  const nextSpin =
    intent.spinVelocity === undefined ? prev.spinVelocity : clamp(intent.spinVelocity, 0, 3);

  const wantsTogglePause = intent.togglePause === true;
  const isPaused = prev.mode === "PAUSE";
  const shouldBePaused = wantsTogglePause ? !isPaused : isPaused;

  const derivedMode: GameMode = shouldBePaused
    ? "PAUSE"
    : nextProgress <= 0.1
      ? "TREE"
      : nextProgress >= 0.9
        ? "TORNADO"
        : "TRANSFORM";

  return {
    mode: derivedMode,
    transformProgress: nextProgress,
    spinVelocity: nextSpin
  };
}
