import type { InputController, InputLifecycle } from "./types";

export type CameraStatus = "not-started" | "starting" | "running" | "stopped" | "error";

export interface CameraController extends InputController {
  getStatus(): InputLifecycle;
  getCameraStatus(): CameraStatus;
  getVideoElement(): HTMLVideoElement;
  getStream(): MediaStream | null;
  startCamera(): Promise<void>;
  stopCamera(): void;
}

export interface CameraOptions {
  onStatusChange?: (status: CameraStatus) => void;
  onError?: (error: unknown) => void;
  constraints?: MediaStreamConstraints;
}

export function createCameraController(opts: CameraOptions = {}): CameraController {
  let lifecycle: InputLifecycle = "stopped";
  let cameraStatus: CameraStatus = "not-started";
  let stream: MediaStream | null = null;

  const video = document.createElement("video");
  video.className = "camera-preview";
  video.autoplay = true;
  video.playsInline = true;
  video.muted = true;

  function setStatus(next: CameraStatus) {
    cameraStatus = next;
    opts.onStatusChange?.(next);
  }

  async function startCamera() {
    if (cameraStatus === "running" || cameraStatus === "starting") return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      const err = new Error("getUserMedia is not available in this browser/environment.");
      opts.onError?.(err);
      return;
    }

    setStatus("starting");
    try {
      stream = await navigator.mediaDevices.getUserMedia(
        opts.constraints ?? {
          video: { facingMode: "user" },
          audio: false
        }
      );
      video.srcObject = stream;
      await video.play().catch(() => {
        // Some browsers require explicit user gesture; the UI start button should provide it.
      });
      setStatus("running");
    } catch (error) {
      setStatus("error");
      opts.onError?.(error);
    }
  }

  function stopCamera() {
    if (cameraStatus !== "running" && cameraStatus !== "starting") {
      if (cameraStatus !== "not-started") setStatus("stopped");
      return;
    }

    if (stream) {
      for (const track of stream.getTracks()) track.stop();
    }
    stream = null;
    video.srcObject = null;
    setStatus("stopped");
  }

  function start() {
    if (lifecycle === "disposed") return;
    if (lifecycle === "started") return;
    lifecycle = "started";
    // Camera start is intentionally user-driven via UI (permissions).
  }

  function stop() {
    if (lifecycle !== "started") return;
    lifecycle = "stopped";
    stopCamera();
  }

  function dispose() {
    if (lifecycle === "disposed") return;
    stop();
    lifecycle = "disposed";
    if (video.parentElement) video.parentElement.removeChild(video);
  }

  return {
    start,
    stop,
    dispose,
    getStatus: () => lifecycle,
    getCameraStatus: () => cameraStatus,
    getVideoElement: () => video,
    getStream: () => stream,
    startCamera,
    stopCamera
  };
}
