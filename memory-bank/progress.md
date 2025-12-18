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
