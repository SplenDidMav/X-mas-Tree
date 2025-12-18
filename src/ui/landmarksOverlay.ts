import type { HandsFrame } from "../input/hands";

type Point = { x: number; y: number };

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function clear(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
}

export interface LandmarksOverlayOptions {
  video: HTMLVideoElement;
}

export function createLandmarksOverlay(opts: LandmarksOverlayOptions) {
  const wrapper = document.createElement("div");
  wrapper.className = "landmarks-overlay";

  const canvas = document.createElement("canvas");
  canvas.className = "landmarks-overlay__canvas";
  wrapper.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context not available");
  const context = ctx;

  let visible = false;
  let lastFrame: HandsFrame | null = null;

  function setVisible(next: boolean) {
    visible = next;
    wrapper.style.display = visible ? "block" : "none";
    if (!visible) {
      const w = canvas.width;
      const h = canvas.height;
      clear(context, w, h);
    } else {
      render();
    }
  }

  function syncCanvasToVideoBox() {
    const w = Math.max(1, Math.floor(opts.video.clientWidth));
    const h = Math.max(1, Math.floor(opts.video.clientHeight));
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    return { w, h };
  }

  function toScreen(p: Point, w: number, h: number) {
    return {
      x: clamp(p.x, 0, 1) * w,
      y: clamp(p.y, 0, 1) * h
    };
  }

  function drawPoints(points: Point[], w: number, h: number) {
    context.fillStyle = "rgba(120, 255, 180, 0.95)";
    for (const p of points) {
      const s = toScreen(p, w, h);
      context.beginPath();
      context.arc(s.x, s.y, 3, 0, Math.PI * 2);
      context.fill();
    }
  }

  function drawConnections(points: Point[], w: number, h: number) {
    // MediaPipe Hands landmark indices (connections are stable across versions).
    const edges: Array<[number, number]> = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [0, 5],
      [5, 6],
      [6, 7],
      [7, 8],
      [5, 9],
      [9, 10],
      [10, 11],
      [11, 12],
      [9, 13],
      [13, 14],
      [14, 15],
      [15, 16],
      [13, 17],
      [17, 18],
      [18, 19],
      [19, 20],
      [0, 17]
    ];

    context.strokeStyle = "rgba(120, 220, 255, 0.75)";
    context.lineWidth = 2;
    for (const [a, b] of edges) {
      const pa = points[a];
      const pb = points[b];
      if (!pa || !pb) continue;
      const sa = toScreen(pa, w, h);
      const sb = toScreen(pb, w, h);
      context.beginPath();
      context.moveTo(sa.x, sa.y);
      context.lineTo(sb.x, sb.y);
      context.stroke();
    }
  }

  function render() {
    if (!visible) return;
    const { w, h } = syncCanvasToVideoBox();
    clear(context, w, h);

    const frame = lastFrame;
    if (!frame?.hasHand || !frame.landmarks) return;

    const points: Point[] = frame.landmarks.map((lm) => ({ x: lm.x, y: lm.y }));
    drawConnections(points, w, h);
    drawPoints(points, w, h);
  }

  function setFrame(frame: HandsFrame | null) {
    lastFrame = frame;
    render();
  }

  setVisible(false);

  return {
    element: wrapper,
    setVisible,
    setFrame
  };
}
