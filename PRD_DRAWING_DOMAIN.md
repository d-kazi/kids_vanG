# Drawing Domain — Curriculum & Skill Tracks

| | |
|---|---|
| **Parent doc** | [`PRD_iOS_APP.md`](PRD_iOS_APP.md) §5.2 (Drawing domain) |
| **Wave 1 spec** | [`PRD_DRAWING_WAVE1.md`](PRD_DRAWING_WAVE1.md) (Precision track) |
| **Version** | 0.1 (Draft for review) |
| **Date** | 2026-05-24 |
| **Status** | Draft |
| **Platform** | iOS native, iPad-first, finger-first |
| **Age focus** | 5–7 (design partner: Caspian, age 5) |

---

## 1. Premise

"Drawing" is not one skill — it's several separately-trainable sub-skills. A child can be a
confident *colorer* and still draw wobbly shapes; he can draw a clean circle and still place
things badly on the page. Treating drawing as a single ladder (e.g., the web prototype's
dot-to-dot stages in [`PRD.md`](PRD.md)) blurs these. This document decomposes the domain from
drawing theory into **parallel skill tracks**, each with its own levels and its own measurable
signals, so a child can progress in one without being blocked by another.

> **Design partner — Caspian (5).** Draws basic shapes but inconsistently; can produce a roughly
> recognizable picture; colors ~80% well. The goal is **more accurate, precise, and consistent**
> objects, and (separately) **composition**. These are different skills — hence tracks.

---

## 2. The skill tracks

Tracks run **in parallel**: each levels up independently, and the child (or parent) can choose a
focus. The numbered order below is a **suggested starting sequence**, not a hard gate.

### Track 1 — Precision / Line & Stroke Control  *(Wave 1 — see [`PRD_DRAWING_WAVE1.md`](PRD_DRAWING_WAVE1.md))*
- **Teaches:** putting an intended line exactly where you want it — straight lines, smooth curves,
  *closed* loops, and repeatable, consistent shapes. The motor foundation of "clean & consistent."
- **Age:** 5+. Foundational; weakest area for Caspian today.
- **How it builds (not magic):** *aim → compare → retry.* Honest feedback + deliberate practice,
  never auto-correction.
- **Signals:** closeness to target (RMS deviation), steadiness/smoothness (jitter), closure gap,
  size/proportion match, cross-attempt consistency.

### Track 2 — Observation & Construction (Accuracy)
- **Teaches:** *seeing* the simple shapes inside objects, relative sizes, and negative space; then
  building objects from primitives with correct proportion and placement so they read as accurate.
- **Age:** 5–7. Builds on Track 1's control.
- **Signals:** proportion/placement accuracy vs. reference, correct shape decomposition, count of
  construction steps completed unaided.

### Track 3 — Composition & Layout
- **Teaches:** arranging elements on the page — placement, relative size, balance, spacing, focal
  point, foreground/background — i.e., building a *scene*, not just an object.
- **Age:** 5–7. The "whole picture" skill the dad specifically called out.
- **Signals:** placement balance, use of page space, size relationships between elements,
  scene completeness.

### Track 4 — Coloring  *(separate track)*
- **Teaches:** fill precision (staying in the lines), color choice, and later blending/harmony.
- **Age:** 4–7. Caspian's relative strength (~80%); polish toward in-the-lines precision and
  intentional color.
- **Signals:** in-bounds fill %, coverage, color-choice intentionality (later).

### Track 5 — Detail & Refinement
- **Teaches:** the distinguishing marks that turn a *recognizable* blob into a *distinct* object
  (whiskers on a cat, windows on a house, patterns/texture).
- **Age:** 5–7, woven into other tracks.
- **Signals:** distinguishing features added, refinement passes.

### Deferred (~7+)
- **Form, value & light (shading)** — making things look 3D.
- **Perspective / depth.**
- **Imagination / from-memory / personal style** — the end goal: drawing well *without* scaffolds.

---

## 3. How tracks relate

- **Parallel, independent leveling.** Each track has its own level ladder and skill estimate. A
  child can be Level 4 Coloring and Level 1 Precision.
- **Suggested start order (guidance, not gates):** Precision → Observation/Construction →
  Composition, with Coloring and Detail running alongside.
- **Cross-track payoff.** Precision (Track 1) makes Construction (Track 2) cleaner; Construction
  makes Composition (Track 3) read better; Detail (Track 5) sharpens everything.
- **Parent app.** Surfaces per-track progress and trends, and can set a focus track (per the
  adaptive + parent-controls model in [`PRD_iOS_APP.md`](PRD_iOS_APP.md) §6).

---

## 4. Shared engine (all tracks)

All tracks run on one iOS drawing engine — a custom, Metal-backed, 120 Hz, **whiteboard-clean**
finger-first canvas (SwiftUI + Observation; modular `DrawingEngine` Swift package; SwiftData
offline). Tracks differ in their **target definitions, feedback overlays, and scoring**, not in the
ink engine. Full architecture lives in [`PRD_DRAWING_WAVE1.md`](PRD_DRAWING_WAVE1.md) §4.

---

## 5. Wave roadmap

- **Wave 1:** Track 1 — Precision / Line Control (this is the buildable slice).
- **Wave 2 (candidate):** Track 3 — Composition (the second skill the dad named), or deeper Track 1.
- **Later:** Observation/Construction depth, Coloring polish, Detail; then the deferred tracks.

## 6. Open items
- Confirm Wave 2 target (Composition vs. Construction/Accuracy).
- Per-track level counts for first content batch.
- Whether to keep dot-to-dot ([`PRD.md`](PRD.md)) as an optional warm-up inside Track 1.
