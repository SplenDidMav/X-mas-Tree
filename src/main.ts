import * as THREE from "three";
import "./style.css";
import { applyIntent, createInitialState } from "./core/stateMachine";
import { createSimulatedInput } from "./input/simulatedInput";
import { createRenderer } from "./scene/renderer";
import { createTreePlaceholder } from "./scene/tree";
import { createDebugHud } from "./ui/debugHud";

let state = createInitialState();
let handsStatus: "not-started" | "loading" | "tracking" | "lost" | "error" = "not-started";

const canvas = document.querySelector<HTMLCanvasElement>("#scene");
if (!canvas) throw new Error("Missing #scene canvas");
const sceneCanvas: HTMLCanvasElement = canvas;

const { renderer, resizeToDisplaySize } = createRenderer(sceneCanvas);
const debugHud = createDebugHud();

const input = createSimulatedInput((intent) => {
  state = applyIntent(state, intent);
});
input.start();

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x050914, 2.5, 10);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(0, 1.1, 3.2);

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
  camera.aspect = clientWidth / Math.max(clientHeight, 1);
  camera.updateProjectionMatrix();
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

  debugHud.render({ state, handsStatus });
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
