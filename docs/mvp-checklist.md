# MVP Checklist (Step 1 Baseline)

This checklist defines the **baseline “runs on a clean machine”** expectations for the project before implementing gameplay features.

## A) Clean Setup Verification

- Confirm Node/NPM versions are reasonable (any modern LTS is OK).
- Install dependencies from scratch (prefer a clean install path).
- Verify the repo does not rely on uncommitted local files (e.g., `node_modules/` artifacts).

**Pass criteria**
- Install completes without errors.
- No runtime errors on first page load.

## B) Command Checks (must pass)

- Run `npm install` (or `npm ci` if `package-lock.json` exists)  
  - Pass: local binaries are installed (e.g., `node_modules/.bin/vite`, `node_modules/.bin/tsc`).
- Run `npm run typecheck`  
  - Pass: exits successfully (no TypeScript errors).
- Run `npm run build`  
  - Pass: exits successfully and produces a production build.
- Run `npm run dev` and open the page  
  - Pass: the canvas renders (not blank) and the browser console shows no uncaught errors.

## C) Baseline UX Expectations (must pass)

- Initial render shows a basic “Tree” placeholder in the Three.js scene.
- Resizing the browser window does not break rendering (no stretching/NaNs/black screen).
- The app remains responsive for at least 60 seconds (no runaway CPU usage or freezes).

## D) Notes (non-goals for Step 1)

- No camera access, hand tracking, gestures, uploads, or recording are required at this stage.
- Performance targets are not enforced yet beyond “does not feel obviously broken”.
