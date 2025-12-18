# Repository Guidelines

## Project Structure

This repo is a Vite + TypeScript web app scaffold for the “Tree ⇄ Tornado” hand‑gesture Christmas tree experience.

- `index.html`: App shell with a single `<canvas>` (`#scene`).
- `src/main.ts`: Entry point; bootstraps Three.js scene and render loop.
- `src/core/`: Shared config/state (`config.ts`, `stateMachine.ts`).
- `src/scene/`: Three.js scene components (`renderer.ts`, `tree.ts`).
- Docs: `tech-stack.md`, `game-design-document.md` (source of truth for scope + architecture).

Recommended growth path (keep boundaries sharp): `src/input/` (camera + hand tracking), `src/media/` (uploads + texture mgmt), `src/ui/` (overlays/controls).

## Setup, Build, and Development

- `npm install`: Install dependencies.
- `npm run dev`: Start local dev server (Vite).
- `npm run build`: Type-check + production build.
- `npm run preview`: Serve the production build locally.
- `npm run typecheck`: Run `tsc --noEmit` only.

## Coding Style & Conventions

- Language: TypeScript (strict mode is enabled).
- Indentation: 2 spaces; keep lines readable and prefer early returns.
- Naming: `camelCase` for functions/vars, `PascalCase` for types/classes, `kebab-case` for docs.
- Three.js: centralize renderer/camera setup in `src/scene/`; avoid ad-hoc WebGL state scattered across files.
- State: route gameplay changes through `src/core/stateMachine.ts` rather than directly mutating scene objects from input handlers.

## Testing

No tests are configured yet. If you add them, prefer:

- Unit: Vitest for pure logic (gesture recognition, state transitions).
- E2E: Playwright for basic “page loads + canvas renders” smoke checks.
- Naming: `tests/**/*.test.ts`.

## Commits & Pull Requests

Git history may be absent in this checkout; use Conventional Commits for clarity:

- `feat: add hand tracking pipeline`, `fix: clamp DPR on resize`

PRs should include a short demo note (GIF/video/screenshot) for visible changes and clear run steps.

## Security & Privacy

Camera processing should stay local by default; never log or upload frames. Do not commit secrets—use `.env` and add `.env.example` when introducing config.
# 重要提示：
- 写任何代码前必须完整阅读 memory-bank/@architecture.md（包含完整数据库结构）
- 写任何代码前必须完整阅读 memory-bank/@game-design-document.md
- 每完成一个重大功能或里程碑后，必须更新 memory-bank/@architecture.md

