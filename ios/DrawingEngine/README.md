# DrawingEngine

The platform-agnostic core of the Drawing domain (Track 1 — Precision / line control).
Pure Swift, Foundation-only, no UIKit/Metal — so it builds and unit-tests anywhere and is reusable
by the iOS app and (later) the Writing domain.

Specs: [`../../PRD_DRAWING_DOMAIN.md`](../../PRD_DRAWING_DOMAIN.md) ·
[`../../PRD_DRAWING_WAVE1.md`](../../PRD_DRAWING_WAVE1.md).

## What's here (Wave 1, build-plan steps 1–2)

The engine implements the **aim → compare → retry** precision mechanic's measurement core — it does
**not** morph or auto-correct the child's stroke.

| Area | Type(s) | Purpose |
|---|---|---|
| Geometry | `Point2D`, `BoundingBox`, `Geometry` | points, resampling, polyline distances |
| Linear algebra | `LinearAlgebra` | 3×3 solve for circle fitting |
| Model | `Stroke`, `ShapeTarget`, `ShapeKind`, `LevelDefinition` | captured stroke, ideal targets, level data |
| Fitting | `ShapeFitter` | least-squares circle (Kåsa) + PCA line fit |
| Scoring | `Tolerances`, `PrecisionAnalysis`, `PrecisionScorer` | closeness, smoothness, closure, size, consistency → 0–1 |
| Progress | `AttemptRecord`, `ProgressTracker`, `ImprovementOutcome` | personal bests, "beat your best", stars |
| Content | `WaveOneLevels` | the 5 "Steady Hand" levels |

### Scoring at a glance
- Comparisons are **orientation- and start-point-independent** (symmetric mean nearest-distance), so
  a circle scores the same wherever the child starts the loop.
- Every sub-score is `0...1` with a smooth falloff (`unitScore`) that hits `0.5` at the tolerance —
  **never a hard zero** for a near-miss.
- Stars reward **improvement vs. the child's own best** first, with an absolute quality floor.
  **No fail state, no peer comparison.**

## Build & test

Requires a Swift toolchain (Xcode 15+ / Swift 5.9+). From this directory:

```bash
swift build
swift test
```

> Note: this repo is developed in a Linux cloud environment with no Swift toolchain, so the package
> is authored but not compiled here — build/test on a Mac.

## Not yet built (next steps)
- **UI layer (app target):** Metal-backed `MTKView` whiteboard canvas (120 Hz, coalesced/predicted
  touch, Catmull-Rom smoothing), SwiftUI shell + Observation, the comparison/diff overlay renderer,
  precision meter, and the level runner.
- **Persistence:** SwiftData store for `AttemptRecord`s and bests.
- **Adaptive difficulty:** tighten/loosen `Tolerances` from logged performance.
- See `PRD_DRAWING_WAVE1.md` §10 for the full build plan.
