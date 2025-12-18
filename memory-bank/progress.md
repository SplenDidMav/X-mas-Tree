## 2025-12-18 — Step 1 (Baseline) Completed

Goal: make sure the repo runs cleanly on a fresh machine and define the baseline acceptance checks.

Changes made:

- Added `docs/mvp-checklist.md` to define Step 1 verification (install + typecheck/build/dev).
- Updated `memory-bank/implementation-plan.md` Step 1 to explicitly require `npm install`/`npm ci` before running scripts.
- Fixed a TypeScript narrowing issue in `src/main.ts` (canvas nullability) so `npm run typecheck` passes.
- Addressed a macOS arm64 Rollup native binary issue by using the WASM Rollup package (see `package.json`) and regenerating `package-lock.json`.
- Added a placeholder `public/favicon.ico` to avoid a noisy 404 in dev.

How to verify (manual + commands):

- `npm install`
- `npm run typecheck`
- `npm run build`
- `npm run dev` → open the page and confirm the canvas renders and console is clean (favicon 404 should be gone).

## 2025-12-18 — Step 2 (Debug HUD) Completed

Goal: add a minimal, toggleable debug HUD to show state and hand-tracking status.

Changes made:

- Added `src/ui/debugHud.ts` to render a small HUD and toggle visibility with the `H` key.
- Wired HUD rendering into the main loop in `src/main.ts`.
- Added HUD styles in `src/style.css`.

How to verify (manual + commands):

- `npm run typecheck`
- `npm run dev` → confirm HUD is visible by default and updates; press `H` to toggle; resize the window and confirm the HUD remains visible and canvas still renders.

## 2025-12-18 — Step 3 (Input Pipeline Skeleton) Completed

Goal: introduce an input layer with a consistent lifecycle and a simulated input source so the game can be exercised without camera/hand tracking.

Changes made:

- Added `src/input/` with:
  - `types.ts`: lifecycle interface + an intent sink contract.
  - `simulatedInput.ts`: mouse/keyboard controls that emit intent (`transformProgress`, `spinVelocity`, pause toggle).
- Extended `src/core/stateMachine.ts` with `GameIntent` and `applyIntent()` to derive mode from intent values.
- Wired the simulated input into `src/main.ts` and applied state to the scene (basic scale/opacity/position response + pause stops rotation) so changes are visible.

How to verify (manual + commands):

- `npm run typecheck`
- `npm run dev` and verify:
  - Mouse wheel adjusts `transformProgress` (tree scales/fades/moves; HUD mode transitions TREE↔TRANSFORM↔TORNADO).
  - Drag left/right or Arrow keys adjust `spinVelocity` (0–3 rad/s) and rotation speed changes.
  - Space toggles pause (rotation stops in PAUSE and resumes after).
