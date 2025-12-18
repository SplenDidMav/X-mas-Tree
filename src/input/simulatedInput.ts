import type { IntentSink, InputController, InputLifecycle } from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export interface SimulatedInputOptions {
  initialSpinVelocity?: number;
  initialTransformProgress?: number;
  minSpinVelocity?: number;
  maxSpinVelocity?: number;
}

export function createSimulatedInput(intentSink: IntentSink, opts: SimulatedInputOptions = {}): InputController {
  let status: InputLifecycle = "stopped";
  let spinVelocity = opts.initialSpinVelocity ?? 0.5;
  let transformProgress = opts.initialTransformProgress ?? 0;
  const minSpin = opts.minSpinVelocity ?? 0;
  const maxSpin = opts.maxSpinVelocity ?? 3;

  let dragging = false;
  let lastClientX = 0;

  function emit() {
    intentSink({ spinVelocity, transformProgress });
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === " ") {
      e.preventDefault();
      intentSink({ togglePause: true });
      return;
    }

    if (e.key === "ArrowLeft") {
      spinVelocity = clamp(spinVelocity - 0.15, minSpin, maxSpin);
      emit();
    } else if (e.key === "ArrowRight") {
      spinVelocity = clamp(spinVelocity + 0.15, minSpin, maxSpin);
      emit();
    } else if (e.key === "ArrowUp") {
      transformProgress = clamp(transformProgress + 0.04, 0, 1);
      emit();
    } else if (e.key === "ArrowDown") {
      transformProgress = clamp(transformProgress - 0.04, 0, 1);
      emit();
    }
  }

  function onWheel(e: WheelEvent) {
    const delta = e.deltaY;
    transformProgress = clamp(transformProgress + (delta > 0 ? -0.03 : 0.03), 0, 1);
    emit();
  }

  function onPointerDown(e: PointerEvent) {
    dragging = true;
    lastClientX = e.clientX;
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging) return;
    const dx = e.clientX - lastClientX;
    lastClientX = e.clientX;
    spinVelocity = clamp(spinVelocity + dx * 0.0025, minSpin, maxSpin);
    emit();
  }

  function onPointerUp() {
    dragging = false;
  }

  function start() {
    if (status === "disposed") return;
    if (status === "started") return;
    status = "started";

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });

    emit();
  }

  function stop() {
    if (status !== "started") return;
    status = "stopped";

    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
  }

  function dispose() {
    if (status === "disposed") return;
    stop();
    status = "disposed";
  }

  return {
    start,
    stop,
    dispose,
    getStatus: () => status
  };
}

