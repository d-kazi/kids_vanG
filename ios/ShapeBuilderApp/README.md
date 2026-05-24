# Shape Builder (iOS app — Drawing Wave 1)

The iPad app for the **Precision / line control** track ("Steady Hand"), built on the
[`DrawingEngine`](../DrawingEngine) core. Implements the **aim → compare → retry** loop end-to-end:
a whiteboard canvas, faint target guide, honest comparison overlay, precision meter, stars, voice +
haptics, and offline SwiftData persistence of personal bests.

Specs: [`../../PRD_DRAWING_WAVE1.md`](../../PRD_DRAWING_WAVE1.md).

## Requirements
- macOS with **Xcode 15+** (iOS 17 SDK). Targets iPad (and iPhone) on iOS 17+.
- [XcodeGen](https://github.com/yonyz/XcodeGen) to generate the project from `project.yml`:
  `brew install xcodegen`.

> This app cannot be built in the Linux cloud environment it was authored in (no Swift/Xcode).
> Expect to run a first `build` on a Mac and resolve any minor API fixups.

## Build & run
```bash
cd ios/ShapeBuilderApp
xcodegen generate          # creates ShapeBuilder.xcodeproj from project.yml
open ShapeBuilder.xcodeproj
# select an iPad simulator and Run
```

### Manual alternative (no XcodeGen)
1. In Xcode: **File ▸ New ▸ Project ▸ iOS App** (SwiftUI, name `ShapeBuilder`, iOS 17).
2. Delete the generated `ContentView`/`App` and add the files under `Sources/` to the target.
3. **File ▸ Add Package Dependencies ▸ Add Local…** and select `../DrawingEngine`.
4. Run on an iPad simulator.

## Structure
```
Sources/
  App/        ShapeBuilderApp (@main), RootView, AppTheme
  Canvas/     CanvasMapping, StrokeCanvasView (UIKit touch+CG), DrawingCanvas (SwiftUI)
  ViewModels/ LevelSessionViewModel (@Observable, the aim→compare→retry runner)
  Models/     AttemptEntity (@Model), SwiftDataAttemptStore
  Services/   SpeechService, HapticsService, AdaptiveDifficulty
  Views/      HomeView, LevelView, Components (meter, stars, buttons)
```

## What's implemented vs planned
- **Implemented:** finger canvas with coalesced-touch capture, all 5 levels (data-driven from
  `WaveOneLevels`), live scoring via `DrawingEngine`, comparison overlay, precision meter + best
  marker, stars/"beat your best", voice prompts, haptics, SwiftData persistence.
- **Planned (next):** Metal renderer for sustained 120 Hz (currently Core Graphics), a richer
  deviation heatmap, CoreHaptics patterns, pre-recorded voice, and live adaptive difficulty
  (`AdaptiveDifficulty` is currently a stable pass-through).
