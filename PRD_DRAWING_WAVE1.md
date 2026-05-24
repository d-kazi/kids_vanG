# Drawing Domain — Wave 1 PRD: Precision / Line Control ("Steady Hand")

| | |
|---|---|
| **Parent docs** | [`PRD_iOS_APP.md`](PRD_iOS_APP.md) §5.2 · [`PRD_DRAWING_DOMAIN.md`](PRD_DRAWING_DOMAIN.md) (Track 1) |
| **Wave** | 1 (first buildable slice of the Drawing domain) |
| **Version** | 0.2 (Draft for review) |
| **Date** | 2026-05-24 |
| **Status** | Draft — open items in §11 |
| **Platform** | iOS native, **iPad-first**, **finger-first** input |
| **Primary user** | Caspian (age 5) — design-partner persona |

> **What this is.** Wave 1 builds **Track 1 — Precision / Line & Stroke Control** from the Drawing
> domain curriculum ([`PRD_DRAWING_DOMAIN.md`](PRD_DRAWING_DOMAIN.md)). It is the motor foundation:
> teaching Caspian's hand to put an intended line exactly where he wants it, and to draw clean,
> closed, repeatable shapes.
>
> **What changed from v0.1.** v0.1 used a "magic tidy" mechanic that morphed wobbly strokes into
> clean ones. We dropped it: tidying *recognizes* clean for him but doesn't build *his* precision.
> Wave 1 now uses **aim → compare → retry** — honest feedback and deliberate practice. Dot-to-dot
> ([`PRD.md`](PRD.md)) is at most an optional warm-up, not the spine.

---

## 1. Who this is for (persona)

**Caspian, age 5.** Draws basic shapes (circles, squares) but **inconsistently** — not round, not
closed, uneven sizes. Can produce a roughly recognizable picture; colors ~80% well. **Goal:** draw
lines and shapes **accurately, precisely, and consistently** — the foundation everything else
(construction, composition, detail) is built on.

---

## 2. The pedagogical bet

Precision is a **motor skill**, and motor skills grow through **deliberate practice with honest
feedback**, not through the app fixing the line for him. So Wave 1's job is to give Caspian a clear
target, let him try, show him *exactly* how close he got and where he drifted, and invite him to
**beat his own best**. Repetition + feedback + visible progress = real precision.

> Teaching, not correcting. We never auto-tidy his line, never show a fail state, and never compare
> him to other children — only to his own previous best.

---

## 3. The Wave 1 levels — "Steady Hand" (Track 1)

A small ladder of precision challenges. Each is a quick, replayable micro-game on the whiteboard.

| # | Level | What it trains | Primary metrics |
|---|---|---|---|
| 1 | **Straight lines** — connect two points | aim + steadiness | closeness, jitter |
| 2 | **Smooth curves / arcs** — follow an arc | smoothness, control | jitter, path closeness |
| 3 | **Closed shapes** — circle, square, triangle | roundness/corners + **closure** + size | deviation, closure gap, size match |
| 4 | **Repeatability** — draw the same shape 3× | **consistency across attempts** | cross-attempt variance |
| 5 | **Control drills** — spirals, zigzags, waves | fine-motor control (fun) | path closeness, smoothness |

**Recommended first buildable slice:** Levels 1–3; Levels 4–5 fast-follow. (Open item §11.)

### 3.1 The core loop — *aim → compare → retry*
1. **Aim (prompt).** A faint **target** appears — the line/shape to produce — with warm voice cue
   (*"Draw a line from the star to the moon!"*). Low text; he needn't read.
2. **Draw.** He draws it freehand with his finger. Ink is buttery and whiteboard-clean; his real,
   wobbly line is shown and respected (no snapping, no morphing).
3. **Compare (honest overlay).** The app overlays his line against the ideal target and **highlights
   where he drifted** (a gentle deviation heatmap / ghosted ideal path). A positive **precision
   meter** fills based on how close he got — framed as encouragement, never "wrong."
4. **Retry to beat your best.** He can immediately try again; the meter shows his **personal best**
   to beat. Celebrate improvement (*"Rounder than last time!"*) with a soft haptic + chime.
5. **Advance.** A gentle next-arrow moves to the next target/level when he's ready. No gate, no fail.

### 3.2 What makes it feel great
- Whiteboard-clean canvas, near-zero chrome, instant ink.
- The overlay is **specific and kind**: he sees *where* to improve, not just a number.
- "Beat your best" turns repetition into a game he *wants* to replay.

### 3.3 Adaptive difficulty (within the track)
Tighten tolerances, lengthen/curve targets, and raise the "best" bar as his precision improves;
loosen if he struggles. Tracks his per-shape precision over time; as raw shapes get cleaner, targets
get more demanding (the scaffold recedes by getting *harder*, not by doing the work for him).

---

## 4. iOS engine architecture (clean, whiteboard, frictionless)

Design intent unchanged from v0.1: a near-empty white canvas, one soft floating toolbar, generous
margins for small hands, and ink so low-latency it feels like a real whiteboard. The custom,
GPU-backed engine is retained; the geometry module is **repurposed for scoring + the comparison
overlay** instead of morphing.

### 4.1 Stack
- **Swift 6 / strict concurrency**, targeting the **latest iOS SDK** (minimum **iOS 17+**).
- **SwiftUI** app shell; state via the **Observation** framework (`@Observable`, unidirectional/MVVM).
- **Custom ink canvas:** a `UIViewRepresentable` wrapping an **`MTKView` (Metal)** render surface.
  - **Input:** `UITouch` with **coalesced** + **predicted** touches for minimum perceived latency.
  - **Smoothing:** real-time **Catmull-Rom → Bézier** resampling; soft constant width for finger.
  - **Rendering:** Metal anti-aliased stroke tessellation at **ProMotion 120 Hz** via
    `CADisplayLink`/`MTKView`; point processing off the main thread.
- **Scene layers (back→front):** paper-white background · faint **target/guide** layer · committed-ink
  layer · active-stroke layer · **comparison/diff-overlay** layer (deviation heatmap + ideal path) ·
  precision-meter / celebration overlay.
- **`ShapeFitter` (pure Swift, unit-tested) — repurposed for measurement:** fits the raw stroke to the
  **known target primitive** and returns **precision metrics**, *not* a replacement stroke:
  - line → linear regression; closeness + jitter
  - circle/ellipse → least-squares fit; roundness, closure gap, size match
  - rect/square, triangle → corner detection; corner quality, closure, size
  - repeatability → variance across the attempt set
  These drive the precision meter, "beat your best," stars, and adaptive difficulty.
- **Comparison overlay renderer (new):** draws the ideal path and a color-coded deviation map of his
  stroke vs. ideal. (**No morph engine in Wave 1** — removed from scope.)
- **Audio:** warm, consistent VO (pre-recorded preferred; `AVSpeechSynthesizer` fallback) + SFX via
  `AVAudioEngine`. **Haptics:** `CoreHaptics` for the "beat your best" moment.
- **Persistence:** **SwiftData** (offline-first) for attempts, personal bests, per-shape precision
  estimates, and the gallery.
- **Modularity:** standalone Swift Package **`DrawingEngine`** (UI-agnostic core: stroke model,
  `ShapeFitter`, scoring, level definitions) + the SwiftUI app target. Reusable across all Drawing
  tracks and the future Writing domain.

### 4.2 Experience budgets (frictionless)
- Cold launch → drawable canvas **< 2 s**.
- Input-to-ink latency **< 16 ms** (target **< 8 ms** on 120 Hz). Sustained **120 fps**.
- **Zero text the child must read** to play; one-tap retry/undo; **no fail states**; no menus/modals.
- **Aesthetic:** off-white canvas, no skeuomorphic clutter; a single floating soft-pill toolbar
  showing at most **retry · undo · next-arrow** (plus the precision meter); rounded, soft shadows,
  lots of negative space; calm palette; wide safe-area margins for palm rest.

### 4.3 Accessibility
Large targets; VoiceOver labels on chrome; **reduced-motion** overlay variant; color-blind-safe
deviation colors; sound on/off.

---

## 5. Content & data model

### 5.1 Level definition (declarative)
Each level is a typed/JSON definition: `targetType` (line | arc | circle | ellipse | rect | triangle |
spiral | zigzag | wave), `targetGeometry` (the ideal path/size, relative to canvas), `tolerances`
(adaptive), `voicePrompt`, and `repeatCount` (for repeatability levels). New challenges = new data.

### 5.2 Captured signals (feed measurement / parent app — parent doc §5–8)
Per attempt: closeness (RMS deviation), smoothness/jitter, closure gap, size/proportion match;
per repeatability set: cross-attempt variance. Per session: levels played, personal-best deltas
(**improvement trend**), stars, duration. Parent surface: *"Caspian's circles are getting rounder
and more closed."*

---

## 6. Acceptance criteria (Wave 1)
- Canvas renders buttery, low-latency finger ink on iPad at 120 Hz, whiteboard-clean aesthetic.
- Levels 1–3 fully playable end-to-end: aim → draw → honest comparison overlay → retry → beat-best.
- `ShapeFitter` computes correct precision metrics (closeness, jitter, closure, size, variance) for
  line, arc, circle, rect, triangle; unit-tested with fixtures.
- Precision meter + stars reward **improvement vs. personal best**; **no fail state** anywhere; **no
  morphing/auto-correction** of the child's stroke.
- Adaptive difficulty raises/lowers tolerances and target demand from logged precision.
- Plays fully **offline**; attempts, bests, and gallery persist locally (SwiftData).
- Meets experience budgets (§4.2) and accessibility minimums (§4.3).

## 7. Success metrics
- Caspian completes precision challenges **independently** (no adult help).
- Measurable **upward trend in precision** over ~2–4 weeks (roundness/closure/closeness improving).
- He **replays to beat his best** (engagement with the retry loop) and returns across sessions.

## 8. Out of scope for Wave 1
- Other Drawing tracks: Construction/Accuracy, Composition, Coloring, Detail (separate waves —
  [`PRD_DRAWING_DOMAIN.md`](PRD_DRAWING_DOMAIN.md)).
- Apple Pencil pressure/tilt (finger-first now; Pencil is a later enhancement).
- Other domains (spatial/reading/writing), monetization, cohort benchmarking.
- Stroke morphing / "magic tidy" (removed).

## 9. Roadmap after Wave 1
- **Wave 2 (candidate):** Composition track (the second skill named), or deeper Precision.
- **Engine reuse:** the same custom canvas + `ShapeFitter` + overlay power Construction/Accuracy and
  the **Writing** domain (letter formation: same "aim → compare → retry" against letter paths).

## 10. Build plan (when approved)
1. `DrawingEngine` Swift Package: stroke model + Metal canvas spike (latency/smoothness proof).
2. `ShapeFitter` precision-metrics + comparison-overlay renderer, with unit tests.
3. Level runner + Level 1 (straight lines) end-to-end; then data-drive Levels 2–3.
4. Precision meter, personal-best persistence (SwiftData), retry loop, rewards.
5. Adaptive difficulty + signal capture; accessibility + experience-budget pass. Then Levels 4–5.

## 11. Open items
- Precision-metric weighting and exactly how "beat your best" is surfaced (tune on-device with him).
- First buildable slice = Levels 1–3 (confirm) vs. including 4–5.
- VO: pre-recorded voice talent vs. synthesized for Wave 1.
- Minimum iOS version (17 vs. latest-only) and device list (which iPad).

> **Dot-to-dot:** kept as an **optional warm-up** inside Track 1, but **rebuilt on the new iOS
> engine** and **de-prioritized** to a later wave (ships after the precision levels). See
> [`PRD_DRAWING_DOMAIN.md`](PRD_DRAWING_DOMAIN.md) §6.
