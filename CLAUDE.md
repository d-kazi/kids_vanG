# Kids VanG — Claude Code project guide

Kids VanG is an iOS learning platform for children aged 3–7 (spatial intelligence, drawing, reading,
writing) plus a parent app. **Current focus: the Drawing domain, Wave 1** — built natively for iOS
(iPad-first, finger-first) for the design partner Caspian (age 5).

## Repository layout
- `ios/` — the active native iOS work (Swift).
  - `ios/DrawingEngine/` — pure-Swift, Foundation-only core (geometry, shape fitting, precision
    scoring, progress). **No UIKit/Metal/SwiftUI** — keep it platform-agnostic and unit-tested.
  - `ios/ShapeBuilderApp/` — the SwiftUI iPad app (Xcode project generated via XcodeGen).
- Root `*.html`, `server.js`, `templates/` — the **legacy web prototype**; superseded for iOS.
- Read before changing scope: `PRD_iOS_APP.md`, `PRD_DRAWING_DOMAIN.md`, `PRD_DRAWING_WAVE1.md`,
  and `ios/DrawingEngine/README.md`.

## Build & test
- Engine (fast loop): `cd ios/DrawingEngine && swift test`
- App: `cd ios/ShapeBuilderApp && xcodegen generate && open ShapeBuilder.xcodeproj` (⌘R on an iPad
  simulator). Headless build:
  `xcodebuild build -project ShapeBuilder.xcodeproj -scheme ShapeBuilder -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO`
- Needs Xcode 15+ (iOS 17 SDK) and `brew install xcodegen`.

## Product decisions (do not silently reverse)
- Drawing is modeled as **parallel skill tracks**: Precision (Wave 1), Observation/Construction,
  Composition, Coloring, Detail — each levels up independently.
- Core mechanic is **aim → compare → retry**: show a target, let the child draw it freehand, show an
  **honest overlay** of their line vs. the ideal, and let them retry to **beat their own best**.
- **No "magic tidy"/auto-correction of strokes. No fail states. No comparison to other children** in
  the child app (peer benchmarking is server-side, anonymized, parent-app only).
- iPad-first, finger-first. Whiteboard-clean, minimal, frictionless UI.

## Conventions
- Keep `DrawingEngine` pure Swift; UI lives only in the app target.
- Levels are **data** (`WaveOneLevels` / `LevelDefinition`), not code.
- Minimal comments — explain *why*, not *what*.

## Important caveat
Much of the Swift was authored in a Linux environment with no Swift toolchain, so treat it as
**written-but-unverified** until it compiles on macOS. The first `swift test` and first Xcode build
are the real gates — fix compile errors as they surface. macOS CI runs both on every push
(`.github/workflows/ios.yml`).
