export type GameMode = "TREE" | "TRANSFORM" | "TORNADO" | "PAUSE";

export interface GameState {
  mode: GameMode;
  transformProgress: number;
  spinVelocity: number;
}

export function createInitialState(): GameState {
  return {
    mode: "TREE",
    transformProgress: 0,
    spinVelocity: 0.5
  };
}

