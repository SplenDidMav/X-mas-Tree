import type { GameState } from "../core/stateMachine";
import type { CameraStatus } from "../input/camera";
import type { HandsStatus } from "../input/hands";

export interface DebugHudModel {
  state: GameState;
  cameraStatus: CameraStatus;
  handsStatus: HandsStatus;
}

export function createDebugHud() {
  const root = document.createElement("div");
  root.className = "debug-hud";
  root.setAttribute("role", "status");
  root.setAttribute("aria-live", "polite");

  const title = document.createElement("div");
  title.className = "debug-hud__title";
  title.textContent = "Debug HUD (press H to toggle)";
  root.appendChild(title);

  const pre = document.createElement("pre");
  pre.className = "debug-hud__body";
  root.appendChild(pre);

  let visible = true;
  function setVisible(next: boolean) {
    visible = next;
    root.style.display = visible ? "block" : "none";
  }

  function toggle() {
    setVisible(!visible);
  }

  function render(model: DebugHudModel) {
    const { state, cameraStatus, handsStatus } = model;
    pre.textContent =
      `mode: ${state.mode}\n` +
      `transformProgress: ${state.transformProgress.toFixed(3)}\n` +
      `spinVelocity: ${state.spinVelocity.toFixed(3)} rad/s\n` +
      `camera: ${cameraStatus}\n` +
      `hands: ${handsStatus}\n`;
  }

  document.body.appendChild(root);
  window.addEventListener("keydown", (e) => {
    if (e.key === "h" || e.key === "H") toggle();
  });

  return { render, setVisible };
}
