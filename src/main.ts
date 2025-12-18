import * as THREE from "three";
import "./style.css";
import { applyIntent, createInitialState } from "./core/stateMachine";
import { createSimulatedInput } from "./input/simulatedInput";
import { createCameraController } from "./input/camera";
import { createHandsController } from "./input/hands";
import { createRenderer } from "./scene/renderer";
import { createTreePlaceholder } from "./scene/tree";
import { createDebugHud } from "./ui/debugHud";
import { createControls } from "./ui/controls";
import { createLandmarksOverlay } from "./ui/landmarksOverlay";

let state = createInitialState();
let cameraStatus: "not-started" | "starting" | "running" | "stopped" | "error" = "not-started";
let handsStatus: "not-started" | "loading" | "tracking" | "lost" | "error" = "not-started";

const canvas = document.querySelector<HTMLCanvasElement>("#scene");
if (!canvas) throw new Error("Missing #scene canvas");
const sceneCanvas: HTMLCanvasElement = canvas;

const { renderer, resizeToDisplaySize } = createRenderer(sceneCanvas);
const debugHud = createDebugHud();

let setControlsError: (message: string | null) => void = () => {};

const cameraController = createCameraController({
  onStatusChange(status) {
    cameraStatus = status;
  },
  onError(error) {
    const message = error instanceof Error ? error.message : String(error);
    setControlsError(message);
  }
});
cameraController.start();

const landmarksOverlay = createLandmarksOverlay({ video: cameraController.getVideoElement() });

const handsController = createHandsController({
  video: cameraController.getVideoElement(),
  onStatusChange(status) {
    handsStatus = status;
  },
  onFrame(frame) {
    landmarksOverlay.setFrame(frame);
  },
  onError(error) {
    const message = error instanceof Error ? error.message : String(error);
    setControlsError(message);
  }
});
handsController.start();

const controls = createControls({
  camera: cameraController,
  isDev: import.meta.env.DEV,
  onToggleKeypoints(visible) {
    landmarksOverlay.setVisible(visible);
  },
  onCameraStatus(status) {
    cameraStatus = status;
    if (status === "running") {
      void handsController.startTracking();
    } else if (status === "stopped" || status === "error") {
      handsController.stopTracking();
    }
  }
});
setControlsError = controls.setError;
document.body.appendChild(controls.element);
controls.previewWrap.appendChild(landmarksOverlay.element);

const input = createSimulatedInput((intent) => {
  state = applyIntent(state, intent);
});
input.start();

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x050914, 2.5, 10);

const viewCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
viewCamera.position.set(0, 1.1, 3.2);

const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xffffff, 1.1);
key.position.set(2, 3, 2);
scene.add(key);

const tree = createTreePlaceholder();
scene.add(tree);

tree.traverse((obj) => {
  if (!(obj instanceof THREE.Mesh)) return;
  const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
  for (const material of materials) {
    if (material instanceof THREE.Material) {
      material.transparent = true;
    }
  }
});

function onResize() {
  resizeToDisplaySize();
  const { clientWidth, clientHeight } = sceneCanvas;
  viewCamera.aspect = clientWidth / Math.max(clientHeight, 1);
  viewCamera.updateProjectionMatrix();
}

window.addEventListener("resize", onResize);
onResize();

const clock = new THREE.Clock();
function tick() {
  const dt = clock.getDelta();
  const isPaused = state.mode === "PAUSE";
  const progress = state.transformProgress;

  const rotationVelocity = isPaused ? 0 : state.spinVelocity;
  tree.rotation.y += rotationVelocity * dt;

  const scale = 1 - progress * 0.65;
  tree.scale.setScalar(scale);
  tree.position.y = -progress * 0.25;
  tree.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const material of materials) {
      if (material instanceof THREE.Material) {
        material.opacity = 1 - progress * 0.85;
      }
    }
  });

  debugHud.render({ state, cameraStatus, handsStatus });
  renderer.render(scene, viewCamera);
  requestAnimationFrame(tick);
}
tick();
