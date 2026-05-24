# Drawing Domain — Wave 1 PRD: "Shape Builder"

| | |
|---|---|
| **Parent doc** | [`PRD_iOS_APP.md`](PRD_iOS_APP.md) §5.2 (Drawing domain) |
| **Wave** | 1 (first buildable slice of the Drawing domain) |
| **Version** | 0.1 (Draft for review) |
| **Date** | 2026-05-24 |
| **Status** | Draft — open items in §11 |
| **Platform** | iOS native, **iPad-first**, **finger-first** input |
| **Primary user** | Caspian (age 5) — design-partner persona |

> **What this supersedes.** The web prototype's 5-stage dot-to-dot ladder ([`PRD.md`](PRD.md))
> was built for a broad 3–6 range and a tap-the-dots mechanic. Wave 1 **reimagines** the
> Drawing domain natively for iOS around a single, deeper level for a 5-year-old. Dot-to-dot
> becomes an optional warm-up in a later wave, not the spine.

---

## 1. Who this is for (persona)

**Caspian, age 5.** Current ability:
- Draws basic shapes (circles, squares) but **inconsistently** (not round, not closed, uneven).
- Can produce a **roughly recognizable** "painting" — you can tell what it is.
- **Colors ~80%** of an object reasonably (not perfect, stays mostly in the area).

**Where we want to take him:** drawing objects **more distinctly, clearly, and consistently** —
clean, closed, well-proportioned shapes assembled into a recognizable object he's proud of.

---

## 2. The pedagogical bet

A child who can already make rough shapes and rough pictures doesn't need more *tracing* — he
needs to learn **construction** (objects are made of simple shapes) and to **internalize what
"clean" looks like** by repeatedly comparing his own line to an ideal.

Wave 1 teaches this with one mechanic loop:

> **Build an object, one shape at a time → draw it raw with your finger → tap "✨ Tidy" and
> watch your wobbly shape smoothly become a clean one → keep going → color it → celebrate.**

This targets the three goals directly:
- **Distinct / clear** — decomposition into shapes + clean tidy + coloring = a recognizable object.
- **Consistent** — repeating the same primitive (circle, line…) across steps and objects, plus the
  visual contrast between his raw line and the tidy ideal, builds his internal model. A gentle
  **wobble meter** motivates closing the gap. Over sessions the tidy correction **fades** as his
  raw shapes improve (scaffolding that recedes).

No tests, no fail states. Effort is always rewarded; "tidy" is a delight, never a correction.

---

## 3. The level: "Shape Builder"

### 3.1 Structure
One level = guided construction of **one object** chosen from a small starter set. Wave 1 ships
**3 starter objects**, ordered easy→harder by shape count:

| Object | Shapes (ordered build steps) |
|---|---|
| **Cat** | big circle (head) → 2 triangles (ears) → oval (body) → small circles (eyes) → lines (whiskers) |
| **Rocket** | tall oval/capsule (body) → triangle (nose) → 2 triangles (fins) → circle (window) → wavy lines (flames) |
| **Flower** | circle (center) → 5 ovals (petals) → line (stem) → 2 ovals (leaves) |

Each object is **data, not code** (see §5.4), so adding more objects later costs no engineering.

### 3.2 The per-step loop (core gameplay)
For each shape-step in the object:
1. **Prompt (voice + visual).** Warm VO: *"Let's draw the cat's head — a big circle, right here!"*
   A faint **ghost target** (where + how big) appears. Low text; the child needn't read.
2. **Draw raw.** Child draws the shape freehand with a finger. Ink is buttery and whiteboard-clean.
   His real, wobbly line is shown and respected.
3. **Tidy moment.** Child taps the friendly **"✨ Tidy"** action. His stroke **morphs/animates**
   (~0.4s, eased) from wobbly into the clean ideal of that shape, snapping into the construction.
   A soft haptic + chime makes it satisfying.
4. **Gentle consistency read.** A small **wobble meter** fills greener the closer his raw line was
   to clean (roundness, closure, proportion). It motivates, never punishes — no numbers, no "wrong."
5. **Advance.** The next shape's prompt appears; the object visibly assembles, step by step.

### 3.3 Coloring (plays to his strength, builds clarity)
After the object is assembled, a calm coloring step: a soft palette tray; **tap-to-fill** a region
or brush within it. Fill is **forgiving** — because the engine knows the vector regions it built,
color stays within the object even if his finger strays. Reinforces "clear, finished" objects.

### 3.4 Reveal & reward
The finished, distinct object animates to life and is saved to his **gallery ("the fridge")**.
Stars (1–3) for: **completion**, **consistency improvement** vs. his own recent average, and
**effort/persistence** — never for raw "accuracy" alone.

### 3.5 Adaptive fading (across sessions)
The engine tracks his per-shape consistency over time. As his raw shapes get cleaner, the **amount
of "tidy" correction shrinks** (the ideal it morphs to stays closer to what he actually drew), so he
gradually owns the clean line himself. Parent app surface: *"Caspian's circles are getting rounder."*

---

## 4. iOS engine architecture (clean, whiteboard, frictionless)

Design intent: a near-empty white canvas, one soft floating toolbar, generous margins for small
hands — and ink so low-latency it feels like a real whiteboard. The guided "tidy" mechanic **requires
access to the raw stroke points**, so the core is a **custom, GPU-backed ink engine** (not PencilKit,
which doesn't expose mid-stroke geometry for our morph/scoring).

### 4.1 Stack
- **Swift 6 / strict concurrency**, targeting the **latest iOS SDK** (minimum **iOS 17+**).
- **SwiftUI** app shell; state via the **Observation** framework (`@Observable`, unidirectional/MVVM).
- **Custom ink canvas:** a `UIViewRepresentable` wrapping an **`MTKView` (Metal)** render surface.
  - **Input:** `UITouch` with **coalesced** + **predicted** touches for minimum perceived latency.
  - **Smoothing:** real-time **Catmull-Rom → Bézier** resampling of the point stream; soft constant
    width for finger input.
  - **Rendering:** Metal anti-aliased stroke tessellation at **ProMotion 120 Hz** via
    `CADisplayLink`/`MTKView`; point processing off the main thread.
- **Scene layers (back→front):** paper-white background · ghost-guide layer · committed-ink layer ·
  active-stroke layer · fill/coloring layer · celebration/confetti overlay.
- **`ShapeFitter` (pure Swift, unit-tested):** fits a raw stroke to a **known target primitive**
  (we prompted the shape, so we know the type):
  - circle/ellipse → least-squares circle/ellipse fit
  - line → linear regression
  - rect/square → bounding-box + corner detection
  - triangle → 3 dominant-corner detection
  - returns **ideal geometry** + **consistency metrics** (normalized RMS deviation, closure gap,
    aspect/size error) → drives the wobble meter, stars, and adaptive fading.
- **Morph engine:** point-correspondence interpolation raw→ideal, `CADisplayLink`-driven, eased
  (~0.4s); preserves his stroke color/width.
- **Coloring:** region-aware fill over the vector regions the level constructed (forgiving, "in the
  lines" by construction).
- **Audio:** warm, consistent VO (pre-recorded preferred; `AVSpeechSynthesizer` fallback) + SFX via
  `AVAudioEngine`. **Haptics:** `CoreHaptics` for the tidy "snap."
- **Persistence:** **SwiftData** (offline-first) for sessions, gallery, and per-shape skill estimates.
- **Modularity:** a standalone Swift Package **`DrawingEngine`** (UI-agnostic core: stroke model,
  `ShapeFitter`, scoring, level definitions) + the SwiftUI app target. Reusable across future domains.

### 4.2 Experience budgets (frictionless)
- Cold launch → drawable canvas **< 2 s**.
- Input-to-ink latency **< 16 ms** (target **< 8 ms** on 120 Hz). Sustained **120 fps**.
- **Zero text the child must read** to play; one-tap undo; **no fail states**; no menus/modals between
  shapes.
- **Aesthetic:** off-white canvas, no skeuomorphic clutter; a single floating soft-pill toolbar
  showing at most **undo · ✨Tidy (when relevant) · color tray (coloring step) · gentle next-arrow**;
  rounded, soft shadows, lots of negative space; calm palette; wide safe-area margins for palm rest.

### 4.3 Accessibility
Large targets; VoiceOver labels on chrome; **reduced-motion** variant of the morph; color-blind-safe
palette; sound on/off.

---

## 5. Content & data model

### 5.1 Level definition (declarative)
Each object is a typed/JSON definition: ordered `steps`, each with `shapeType`
(circle | ellipse | line | rect | triangle | polyline), `targetGeometry` (position/size of the ghost
guide, relative to canvas), `voicePrompt`, `colorRegions`, and `palette`. New objects = new data.

### 5.2 Captured signals (feed measurement / parent app — see parent doc §5–8)
Per shape: consistency metrics (roundness, closure, proportion), tidy-correction magnitude, attempts/
undos, time. Per session: object completed, stars, consistency-vs-own-average trend, duration.

---

## 6. Acceptance criteria (Wave 1)
- Canvas renders buttery, low-latency finger ink on iPad at 120 Hz, whiteboard-clean aesthetic.
- All 3 starter objects are fully playable end-to-end: prompt → raw draw → tidy morph → assemble →
  color → reveal/save to gallery.
- `ShapeFitter` correctly fits and morphs circle, ellipse, line, triangle, rect to clean ideals; unit-
  tested with fixtures.
- Wobble meter + stars compute from real metrics; **no fail state** exists anywhere.
- Adaptive fading reduces tidy-correction as logged consistency improves.
- Plays fully **offline**; sessions + gallery persist locally (SwiftData).
- Meets experience budgets (§4.2) and accessibility minimums (§4.3).

## 7. Success metrics
- Caspian completes a full object **independently** (no adult help) in a session.
- Measurable **upward trend in raw-shape consistency** over ~2–4 weeks (pre-tidy roundness/closure).
- He **chooses to play again** (return sessions) and wants to color/keep results.

## 8. Out of scope for Wave 1
- Free-draw-from-memory, dot-to-dot, ghost-fade stages (later waves).
- Apple Pencil pressure/tilt (finger-first now; Pencil is a later enhancement).
- The other domains (spatial/reading/writing), monetization, and cohort benchmarking.

## 9. Roadmap after Wave 1
- **Wave 2:** more objects (data only); reduce guides further; introduce "draw it yourself, then check."
- **Wave 3:** free-draw challenge from a brief prompt; creativity rewards.
- **Engine reuse:** the same custom canvas + fitter powers the **Writing** domain (letter formation).

## 10. Build plan (when approved)
1. `DrawingEngine` Swift Package: stroke model + Metal canvas spike (latency/smoothness proof).
2. `ShapeFitter` + morph engine with unit tests.
3. Level runner + 1 object (Cat) end-to-end; then data-drive Rocket + Flower.
4. Coloring + gallery (SwiftData) + rewards + wobble meter.
5. Adaptive fading + signal capture; accessibility + experience-budget pass.

## 11. Open items
- VO: pre-recorded voice talent vs. synthesized for Wave 1.
- Starter object set — confirm Cat / Rocket / Flower (or swap to Caspian's favorites).
- Exact tidy-morph feel (duration/easing/haptic) — tune on-device with him.
- Minimum iOS version (17 vs. latest-only) and device list (which iPad).
