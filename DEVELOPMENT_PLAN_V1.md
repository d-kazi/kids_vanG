## Development Plan: From MVP to V1 (Building on Existing Work)

This plan assumes the current MVP is running with: canvas engine, three templates (smiley/child/hero), strategic voice feedback, file‑based session logs, admin dashboard, invite tokens, and deployment guidance. Tasks below extend functionality without redoing completed work.

### Milestone A — Content System Foundations (1–2 weeks)
1) Template schema extensions
   - Add fields: `stage` (1–5), `difficulty` (1–5), `guideType` ("dots", "trace", "anchors", "ghost", "free")
   - Add optional: `dotSpacingHint`, `ghostOpacityStart`, `ghostOpacityEnd`
   - Backward compatible loader in `wireframe_mockup.html`

2) Content manifest
   - Create `templates/manifest.json` listing all template files with stage/difficulty
   - Update loader to optionally browse/select from manifest (hidden admin toggle)

3) Analytics updates
   - Extend session payload to include `stage`, `difficulty`, `guideType`, `starsAwarded`, `stickersEarned`
   - Update `/api/analytics` aggregation by stage and difficulty

### Milestone B — Stage Mechanics (2–3 weeks)
4) Stage 2: Trace‑over mode
   - Render dotted outline path; user must follow with tolerance window
   - Progress measured by path coverage rather than visiting discrete dots
   - Reuse voice cadence; adjust prompts to “keep tracing!”

5) Stage 3: Partial‑dot anchors
   - Only anchor dots visible; freehand curves connect anchors
   - Path validation loosened; focus on sequence between anchors

6) Stage 4: Ghost/fading guides
   - Render faint guide that linearly fades as user advances
   - Parameterize fade curve via template fields

7) Stage 5: Free‑draw challenges
   - Show prompt image or text for 5 seconds, then hide
   - Record drawing; award stars by completion effort (heuristics)

### Milestone C — Content Production (parallel, 2–4 weeks)
8) Stage 1 templates (10–12)
   - Basic shapes, simple objects, animals per PRD

9) Stage 2 templates (12–15)
   - Faces, curves objects, vehicles per PRD

10) Stage 3 templates (8–10)
   - Animals, characters, scenes per PRD

11) Stage 4 templates (6–8)
   - Dino, rocket+stars, dragon/unicorn, complex face per PRD

12) Stage 5 challenges (5–6)
   - Prompts only; no fixed dots

### Milestone D — Gamification Layer (1–2 weeks)
13) Progression system
   - Unlock next stage after X completed templates
   - Persist unlocks by token (or simple local storage keyed by token)

14) Stars and stickers
   - Stars: accuracy (dot hit ratio / path coverage), persistence (undos used), creativity (free‑draw effort)
   - Stickers inventory UI; add to avatar/book screen

15) Daily challenge mode
   - Picks one unlocked template across stages; adds bonus sticker

### Milestone E — Admin & Ops (1 week)
16) Admin dashboard v2
   - Charts by stage/difficulty; completion times; star distribution
   - Recent sessions with stage and rewards

17) Content toggles
   - Enable/disable templates via `manifest.json` flags
   - Hidden admin URL param to preview disabled content

### Milestone F — Polish & QA (ongoing)
18) UX refinements
   - Clearer start dot marker per stage type
   - Tutorial overlays for first time in each stage

19) Performance
   - OffscreenCanvas for heavy redraws
   - Throttle pointer events in trace/ghost modes

20) Accessibility & localization
   - Alt text for prompts, sound on/off toggle
   - Externalize feedback strings for future i18n

---

### Testing & Quality Gates (applies across milestones)

Core goals: prevent regressions to MVP behaviors, validate new mechanics per stage, and ensure analytics/voice contracts remain stable.

1) Unit tests (logic-level)
   - Dot sequencing rules (next-dot detection, out-of-order taps ignored)
   - Feature progression (completion → advance to next feature)
   - Loop closing only when feature complete (outline, eyes, mask)
   - Voice cadence state machine (start/middle/end flags)
   - Manifest parsing and template metadata mapping

2) Contract tests (backend/API)
   - `POST /api/log-session` accepts legacy + new fields; calculates `completionRate`
   - `GET /api/analytics` includes `templateUsage`, `stageUsage`, `difficultyUsage`
   - `GET /api/feedback` returns message for each `feedbackType` × template
   - `GET /api/validate-token` behavior unchanged

3) Integration tests (browser-level; manual or scripted)
   - Use existing scenarios in `high_level_integration_tests.txt`
   - Add stage-specific flows: trace-over tolerance (Stage 2), anchors (Stage 3), ghost fade (Stage 4), free-draw prompt (Stage 5)

4) Visual checks (lightweight)
   - Screenshot before/after key flows on a fixed viewport; compare manually for major drift
   - Start-dot visibility and labels verified per template

5) Performance budgets
   - First interaction < 2s after load on mid-tier device
   - Pointer latency < 50ms for tracing modes

6) Test data & fixtures
   - Minimal JSON templates for each stage to drive tests (small dot sets)
   - Sample session payloads (legacy and extended) checked into `tests/fixtures/`

7) CI pipeline (GitHub Actions)
   - On PR: install, run unit/contract tests, lint, and a headless smoke test
   - On main: same + deploy (if configured)

8) Release gates
   - Milestone exit requires: unit tests green, contract tests green, integration checklist signed, no perf regressions vs. baseline

— Additions to milestones —
• Milestone A (foundations):
  - Unit: manifest parsing, session payload build with metadata
  - Contract: `log-session` accepts new fields; analytics aggregates stage/difficulty

• Milestone B (stage mechanics):
  - Unit: per-stage progression rules, tolerance computations
  - Integration: one golden-flow test per stage type

• Milestone C (content):
  - Validation script: all templates conform to schema and render without errors

• Milestone D (gamification):
  - Unit: unlock logic; stars/stickers calculation
  - Contract: analytics includes rewards fields (if added)

• Milestone E (admin):
  - Contract: dashboard queries; fields present and typed
  - Visual: bars render for stage/difficulty

### Concrete Tasks (Actionable Checklist)
// Foundations
- Extend template loader to read optional `stage`, `difficulty`, `guideType`
- Define `templates/manifest.json` and integrate selection logic
- Modify session payload and `/api/analytics` to include new fields

// Stage mechanics
- Implement trace‑over rendering and tolerance detection (Stage 2)
- Implement anchor‑based progression (Stage 3)
- Implement ghost guide rendering with fade parameters (Stage 4)
- Implement free‑draw prompt show/hide and effort metrics (Stage 5)

// Content
- Author and validate Stage 1 templates (≥10)
- Author and validate Stage 2 templates (≥12)
- Author and validate Stage 3 templates (≥8)
- Author and validate Stage 4 templates (≥6)
- Author Stage 5 prompts (≥5)

// Gamification
- Implement unlock logic and persistence
- Compute and award stars; log to session
- Sticker inventory and avatar/book screen
- Daily challenge rotation and bonus

// Admin & Ops
- Dashboard charts by stage/difficulty and rewards
- Manifest flags for enable/disable; admin preview switch

// Polish
- Tutorial overlays per stage
- Pointer throttling and OffscreenCanvas where beneficial
- Externalize UI/voice strings for i18n readiness

// Testing & QA
- Add unit tests for sequencing, progression, cadence, manifest parsing
- Add API contract tests for log-session, analytics, feedback, validate-token
- Add stage-specific integration checklists; automate smoke where feasible
- Add minimal visual regression via fixed screenshots for key flows
- Add GitHub Actions workflow running tests on PRs

---

### Dependencies and Sequencing
1) Do Milestone A first (schema/manifest/analytics) to unblock later work.
2) Build Stage 2 → 3 → 4 → 5 mechanics in order (B4–B7).
3) Produce content in parallel once each stage mechanic is ready.
4) Layer gamification after at least Stage 2 is playable and logged.
5) Upgrade admin analytics once new fields are being recorded.

### Done/No‑Redo (Already Completed)
- HTML5 Canvas engine with dot sequencing and undo
- Strategic voice feedback (start/middle/end)
- Session logging to filesystem and analytics endpoint
- Admin dashboard v1 with totals/averages and recent sessions
- Templates: smiley, child (with blush), Spider‑Man hero
- Token‑gated access and deployment instructions


