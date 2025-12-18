import type { CameraController, CameraStatus } from "../input/camera";

export interface ControlsOptions {
  camera: CameraController;
  onCameraStatus?: (status: CameraStatus) => void;
  isDev?: boolean;
  onToggleKeypoints?: (visible: boolean) => void;
}

function formatCameraStatus(status: CameraStatus) {
  switch (status) {
    case "not-started":
      return "camera: not started";
    case "starting":
      return "camera: starting (permission prompt?)";
    case "running":
      return "camera: running";
    case "stopped":
      return "camera: stopped";
    case "error":
      return "camera: error";
  }
}

export function createControls(opts: ControlsOptions) {
  const root = document.createElement("div");
  root.className = "controls";

  const row = document.createElement("div");
  row.className = "controls__row";
  root.appendChild(row);

  const startBtn = document.createElement("button");
  startBtn.className = "controls__button";
  startBtn.type = "button";
  startBtn.textContent = "Enable camera";
  row.appendChild(startBtn);

  const stopBtn = document.createElement("button");
  stopBtn.className = "controls__button";
  stopBtn.type = "button";
  stopBtn.textContent = "Stop camera";
  stopBtn.disabled = true;
  row.appendChild(stopBtn);

  const previewBtn = document.createElement("button");
  previewBtn.className = "controls__button";
  previewBtn.type = "button";
  previewBtn.textContent = "Show preview";
  row.appendChild(previewBtn);

  let keypointsBtn: HTMLButtonElement | null = null;
  let keypointsVisible = false;
  if (opts.isDev) {
    keypointsBtn = document.createElement("button");
    keypointsBtn.className = "controls__button";
    keypointsBtn.type = "button";
    keypointsBtn.textContent = "Show keypoints";
    row.appendChild(keypointsBtn);
  }

  const statusLine = document.createElement("div");
  statusLine.className = "controls__status";
  root.appendChild(statusLine);

  const errorLine = document.createElement("div");
  errorLine.className = "controls__error";
  root.appendChild(errorLine);

  let previewVisible = false;
  const video = opts.camera.getVideoElement();
  video.style.display = "none";

  const previewWrap = document.createElement("div");
  previewWrap.className = "controls__preview";
  previewWrap.appendChild(video);
  root.appendChild(previewWrap);

  function setStatus(status: CameraStatus) {
    statusLine.textContent = formatCameraStatus(status);
    opts.onCameraStatus?.(status);
    stopBtn.disabled = status !== "running" && status !== "starting";
  }

  function setError(message: string | null) {
    errorLine.textContent = message ?? "";
    errorLine.style.display = message ? "block" : "none";
  }

  setStatus(opts.camera.getCameraStatus());
  setError(null);

  startBtn.addEventListener("click", async () => {
    setError(null);
    await opts.camera.startCamera();
    setStatus(opts.camera.getCameraStatus());
  });

  stopBtn.addEventListener("click", () => {
    setError(null);
    opts.camera.stopCamera();
    setStatus(opts.camera.getCameraStatus());
  });

  previewBtn.addEventListener("click", () => {
    previewVisible = !previewVisible;
    video.style.display = previewVisible ? "block" : "none";
    previewBtn.textContent = previewVisible ? "Hide preview" : "Show preview";
  });

  keypointsBtn?.addEventListener("click", () => {
    keypointsVisible = !keypointsVisible;
    keypointsBtn!.textContent = keypointsVisible ? "Hide keypoints" : "Show keypoints";
    opts.onToggleKeypoints?.(keypointsVisible);
  });

  return {
    element: root,
    previewWrap,
    setStatus,
    setError
  };
}
