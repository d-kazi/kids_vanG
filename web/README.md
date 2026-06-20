# Kids VanG — Web (Drawing Wave 1)

The active implementation of the Drawing domain Wave 1 ("Steady Hand" — Precision / line
control). Built on the **aim → compare → retry** mechanic: faint target → child draws freehand →
honest comparison overlay + precision meter → retry to beat their own best. No magic-tidy, no
fail states, no peer comparison.

Specs: [`../PRD_DRAWING_DOMAIN.md`](../PRD_DRAWING_DOMAIN.md) ·
[`../PRD_DRAWING_WAVE1.md`](../PRD_DRAWING_WAVE1.md).

## Stack
- **Vite 6 + React 19 + TypeScript** (strict)
- **Tailwind v4** (`@theme` design tokens, no `tailwind.config`)
- **Pointer Events + Canvas 2D** for low-latency finger/Pencil ink with coalesced events
- **localStorage** for offline personal bests; **Web Speech API** for voice prompts
- **Vitest** for unit tests on the engine

## Run it
```bash
npm install
npm run dev        # http://localhost:5173
npm test           # engine unit tests
npm run typecheck  # tsc --noEmit
npm run build      # production bundle in dist/
```

Open the dev URL on an iPad in Safari for the real touch test, or "Add to Home Screen" to
install it as a PWA-style icon.

## Layout
```
src/
  lib/engine/      Pure-TS scoring core (ported from ios/DrawingEngine)
                   geometry, linearAlgebra, stroke, shapeTarget, shapeFitter,
                   tolerances, precision, scorer, progressTracker, waveOneLevels
  components/      DrawingCanvas, PrecisionMeter, Stars, ResultPanel, LevelCard
  pages/           HomePage, LevelPage
  state/           useSession (the aim→compare→retry runner)
  services/        speech, storage
tests/             engine unit tests (geometry, shapeFitter, precision, progressTracker)
```

## Engine notes
The engine is a faithful TypeScript port of the Swift `DrawingEngine`, with immutable types
and a cleaner discriminated-union `ShapeTarget`. The math (Kåsa circle fit, PCA line fit,
symmetric mean-nearest closeness, curvature-std smoothness, closure gap, "beat your best"
stars) is identical. See `ios/DrawingEngine/` for the Swift reference.
