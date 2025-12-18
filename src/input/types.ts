import type { GameIntent } from "../core/stateMachine";

export type InputLifecycle = "stopped" | "started" | "disposed";

export interface InputController {
  start(): void;
  stop(): void;
  dispose(): void;
  getStatus(): InputLifecycle;
}

export type IntentSink = (intent: GameIntent) => void;

