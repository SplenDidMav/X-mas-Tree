import * as THREE from "three";
import { CONFIG } from "../core/config";

export function createRenderer(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });

  function resizeToDisplaySize() {
    const { clientWidth, clientHeight } = canvas;
    const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDevicePixelRatio);
    renderer.setPixelRatio(dpr);
    renderer.setSize(clientWidth, clientHeight, false);
  }

  return { renderer, resizeToDisplaySize };
}

