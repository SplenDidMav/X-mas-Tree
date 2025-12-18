import * as THREE from "three";
import "./style.css";
import { createInitialState } from "./core/stateMachine";
import { createRenderer } from "./scene/renderer";
import { createTreePlaceholder } from "./scene/tree";
import { createDebugHud } from "./ui/debugHud";

const state = createInitialState();
let handsStatus: "not-started" | "loading" | "tracking" | "lost" | "error" = "not-started";

const canvas = document.querySelector<HTMLCanvasElement>("#scene");
if (!canvas) throw new Error("Missing #scene canvas");
const sceneCanvas: HTMLCanvasElement = canvas;

const { renderer, resizeToDisplaySize } = createRenderer(sceneCanvas);
const debugHud = createDebugHud();

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
  tree.rotation.y += state.spinVelocity * dt;
  debugHud.render({ state, handsStatus });
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
