# Kids VanG — Claude Code project guide

Kids VanG is a learning platform for children aged 3–7 (spatial intelligence, drawing,
reading, writing) plus a parent app. **Current focus: the Drawing domain, Wave 1**, built
for the design partner Caspian (age 5).

**Platform pivot:** the active implementation is now a **web app** (`web/`). The earlier
native-iOS work in `ios/ShapeBuilderApp/` was removed; iOS is deferred until the web
experience is solid. The pure-Swift `ios/DrawingEngine/` package is **kept as a reference
implementation** of the scoring core — the canonical engine going forward is the
TypeScript port at `web/src/lib/engine/`.

## Repository layout
- `web/` — **active implementation.** Vite 6 + React 19 + TypeScript + Tailwind v4.
  - `web/src/lib/engine/` — pure-TypeScript precision-scoring engine (canonical).
  - `web/src/components/` — DrawingCanvas (Pointer Events + Canvas 2D), meter, stars, etc.
  - `web/src/pages/` — HomePage (level picker), LevelPage (the aim→compare→retry runner).
  - `web/tests/` — Vitest unit tests for the engine.
- `ios/DrawingEngine/` — Swift reference implementation of the engine (kept; no UI).
- Root `*.html`, `server.js`, `templates/` — **legacy** dot-to-dot prototype; superseded.
- Read before changing scope: `PRD_iOS_APP.md`, `PRD_DRAWING_DOMAIN.md`,
  `PRD_DRAWING_WAVE1.md`, and `web/README.md`.

## Build & test (web — the active stack)
```bash
cd web
npm install
npm run dev        # http://localhost:5173
npm test           # vitest engine tests
npm run typecheck  # tsc --noEmit
npm run build      # production bundle
```
- Engine tests are the fast inner loop and run on every CI push (`.github/workflows/web.yml`).
- The Swift reference engine still has its own CI (`.github/workflows/ios.yml`) — runs
  `swift test` on the `ios/DrawingEngine` package on macOS.

## Product decisions (do not silently reverse)
- Drawing is modeled as **parallel skill tracks**: Precision (Wave 1), Observation/Construction,
  Composition, Coloring, Detail — each levels up independently.
- Core mechanic is **aim → compare → retry**: show a target, let the child draw it freehand,
  show an **honest overlay** of their line vs. the ideal, let them retry to **beat their own
  best**.
- **No "magic tidy"/auto-correction of strokes. No fail states. No comparison to other
  children** in the child app (peer benchmarking is server-side, anonymized, parent-app only).
- iPad-first, finger-first. Whiteboard-clean, minimal, frictionless UI.

## Conventions
- Keep the engine (`web/src/lib/engine/`) pure logic — no React, no DOM, no side effects.
- Levels are **data** (`WaveOneLevels` / `LevelDefinition`), not code.
- Immutable types (readonly everywhere) and discriminated unions for typed sums.
- Minimal comments — explain *why*, not *what*.

## CI
Web changes auto-test on Linux (Vite typecheck + Vitest + build). Swift engine changes
auto-test on macOS. The first time anything touches both, both jobs run.
