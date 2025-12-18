## Current Architecture (Step 1 Baseline)

This repository is a Vite + TypeScript + Three.js scaffold intended to evolve into a hand-gesture-driven “Tree ⇄ Tornado” experience (see `memory-bank/game-design-document.md` and `memory-bank/tech-stack.md`).

### Runtime Flow (today)

- `index.html` hosts a single `<canvas id="scene">`.
- `src/main.ts` initializes Three.js (scene/camera/lights), creates a placeholder tree object, handles resize, and runs the render loop.
- Future input (camera + MediaPipe hands) will feed a state machine; scene objects should be driven by state, not directly by raw input.

### File & Directory Roles

- `index.html`: Minimal app shell; keeps the UI lightweight (no framework).
- `src/main.ts`: App entry; wires together renderer, scene objects, and the main animation loop.
- `src/style.css`: Global layout + basic HUD styling; keeps the canvas full-screen.

**Core**
- `src/core/config.ts`: Central tunables (e.g., max DPR cap). Add future thresholds here (gesture/cooldowns/perf caps).
- `src/core/stateMachine.ts`: Game state types + initial state. This will expand to the 6-state model from the GDD.

**Scene**
- `src/scene/renderer.ts`: Three.js renderer creation + resize/DPR policy. Keep WebGL settings centralized here.
- `src/scene/tree.ts`: Tree-mode object construction. Currently a placeholder; later grows into the full tree.

**UI**
- `src/ui/debugHud.ts`: Minimal developer HUD (toggle with `H`). Displays game state (`mode`, `transformProgress`, `spinVelocity`) and a placeholder hand-tracking status to make debugging faster.

**Tooling / Project**
- `package.json`: Scripts (`dev`, `build`, `typecheck`) and dependencies. Uses Rollup WASM to avoid native binary issues on macOS arm64.
- `package-lock.json`: Locked dependency tree; required for reproducible installs.
- `tsconfig.json`: Strict TypeScript config for stability.
- `vite.config.ts`: Vite dev server config.
- `.gitignore`: Excludes build outputs and local artifacts.
- `public/favicon.ico`: Placeholder favicon to keep dev console clean.

**Docs**
- `memory-bank/implementation-plan.md`: Single source of truth for the step-by-step plan.
- `docs/mvp-checklist.md`: Step 1 “clean machine” baseline checks.
- `memory-bank/progress.md`: Running log of completed steps and what changed.

### Near-Term Extension Points

- Add `src/ui/` for overlays/HUD and keep DOM/UI logic out of `src/main.ts`.
- Add `src/input/` for camera + hands pipeline; expose normalized “intent” values/events to the state machine.
- Add `src/scene/tornado.ts` and `src/scene/transition.ts` once the Tornado mode and transform animation start.
