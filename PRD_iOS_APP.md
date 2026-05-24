# Product Requirements Document — Kids VanG iOS Learning Platform

| | |
|---|---|
| **Product** | Kids VanG — child development platform (Child app + Parent app) |
| **Document** | Comprehensive Product PRD (MVP → V1 → Future) |
| **Version** | 0.1 (Draft for review) |
| **Date** | 2026-05-24 |
| **Status** | Draft — open decisions flagged in §3 and §17 |
| **Platform** | iOS native, **iPad-first** (iPhone in a later phase) |
| **Primary market / language** | English (US/UK), English-first reading & writing |

> **Relationship to existing repo.** The current repository is a web-based dot-to-dot
> drawing prototype with a 5-stage drawing ladder (see [`PRD.md`](PRD.md)). That ladder
> is preserved and folded into this document as the **Drawing** domain (§5.2). This PRD
> expands the product from a single-skill web prototype into a native iOS platform
> covering four developmental domains plus a dedicated parent app.

---

## 1. Overview & Vision

### 1.1 Vision
A calm, joyful iPad companion that helps children aged **3–7** grow across four core
developmental domains — **spatial intelligence, drawing, reading, and writing** — through
short, adaptive, play-based activities. A separate **Parent app** translates the child's
play into clear, trustworthy insight: how the child is developing against established
age norms and against an anonymized peer cohort, with concrete next steps.

### 1.2 Problem statement
- Parents of young children want to support early development but lack a clear, objective
  picture of *where their child is* and *what to do next*.
- Existing kids' apps optimize for engagement/screen time, not measurable developmental
  progress, and rarely give parents trustworthy, privacy-safe benchmarking.
- Skill-building apps tend to be single-domain (just phonics, just tracing) and don't
  connect domains (e.g., fine-motor control underpins both drawing and writing).

### 1.3 Product thesis
1. **Child app**: bite-sized, adaptive activities that feel like play, not testing.
2. **Measurement-by-play**: development is inferred primarily from normal activity, not
   from stressful explicit tests.
3. **Parent app**: turns play signals into milestone-based and peer-relative insight, with
   privacy as a first-class constraint.

---

## 2. Goals & Non-Goals

### 2.1 Goals (what success looks like)
- A child can independently complete a 5–10 minute session across one or more domains with
  minimal adult help (age-appropriate, low-text, voice-guided UI).
- The app adapts difficulty per child per domain so activities stay in the "just right" zone.
- Parents receive a weekly, plain-language readout of progress vs. age norms and vs. an
  anonymized peer cohort, plus 1–3 suggested focus areas.
- Strict compliance with children's-privacy law and the App Store Kids Category.

### 2.2 Non-Goals (explicitly out of scope for now)
- Social features for children, chat, user-generated content sharing, or any child-to-child
  contact.
- In-app advertising or third-party behavioral tracking of children.
- AI image generation of arbitrary content for children.
- Android / web-app parity at launch (web prototype remains a separate internal track).
- Clinical diagnosis. The product provides developmental *guidance*, not medical assessment.
- Networked multiplayer / real-time collaboration.

---

## 3. Key Decisions & Open Questions

### 3.1 Decisions locked for this PRD
| Topic | Decision |
|---|---|
| Core skill #1 | **Spatial intelligence** (visual-spatial reasoning) |
| Lead device | **iPad-first**; optimize for finger + (later) Apple Pencil |
| Reading/writing language | **English-first** |
| Pedagogy | **Adaptive / personalized** difficulty per child per domain |
| Benchmarking | **Developmental norms + anonymized cohort** percentiles |
| Document scope | **MVP + future vision** (phased) |

### 3.2 Open decisions (need owner sign-off — see §17)
- **Monetization model** — *undecided.* Recommendation in §16; choose before build.
- **Assessment data capture** — *undecided.* Recommendation: primarily embedded-in-play with
  optional periodic calibration check-ins (§7). Confirm before instrumenting.
- **Apple Pencil dependency** — assumed optional for MVP; confirm.
- **Norm dataset sourcing** — which standards/datasets we license or derive norms from (§8.3).

---

## 4. Target Users & Personas

### 4.1 Primary: the Child (end user of the Child app)
- **Age band A — 3–4 yrs:** emerging fine-motor control, pre-literate, short attention
  (2–4 min), needs large targets, heavy voice guidance, near-zero reading.
- **Age band B — 5 yrs:** improving control, letter/sound awareness beginning, can follow
  2-step instructions.
- **Age band C — 6–7 yrs:** reading simple words, forming letters, longer focus (8–12 min),
  enjoys challenge and mastery.

Design implication: the same activity must scale across these bands via the adaptive engine,
not via separate apps.

### 4.2 Primary: the Parent (end user of the Parent app)
- Wants reassurance and direction, not jargon. Time-poor. Checks in a few times per week.
- Cares about privacy and screen-time quality.
- Manages **one account → one or more child profiles**.

### 4.3 Secondary (future): Educators / specialists
- Out of scope for MVP; informs roadmap (classroom/multi-child dashboards).

---

## 5. The Four Skill Domains

Each domain defines: learning objectives, an age-scaled progression, representative
activities, and the signals captured for measurement.

### 5.1 Spatial Intelligence
**Objective:** build visual-spatial reasoning — shape recognition, pattern completion,
symmetry, mental rotation, part/whole relationships, and simple spatial navigation.

**Progression (adaptive):**
1. *Match & sort* — match shapes/colors, sort by attribute.
2. *Patterns* — complete and extend visual sequences (ABAB → ABB).
3. *Symmetry & reflection* — mirror a half-image; find the matching half.
4. *Mental rotation* — pick which rotated piece fits a gap.
5. *Spatial puzzles* — tangram-style assembly; simple mazes / pathfinding.

**Signals:** accuracy, time-to-solve, rotation difficulty solved, error patterns,
hint usage.

### 5.2 Drawing  *(reimagined for iOS — detailed spec in [`PRD_DRAWING_WAVE1.md`](PRD_DRAWING_WAVE1.md))*
**Objective:** move a child from rough, inconsistent shapes to **distinct, clear, consistent
objects** — fine-motor control, line confidence, and creative expression.

**Wave 1 focus — age 5, finger-first ("Shape Builder").** Build a recognizable object one
primitive shape at a time; draw each shape raw with a finger, then tap **"✨ Tidy"** to watch the
wobbly stroke morph into a clean ideal; assemble; color; celebrate. Teaches **construction** and an
internal model of "clean," with a gentle **wobble meter** and **fading** tidy-assist as skill grows.
Built on a custom, Metal-backed, 120 Hz **whiteboard-clean** ink engine (not PencilKit, since the
tidy mechanic needs raw-stroke access). See the dedicated PRD for the level, mechanic, and engine
architecture.

**Later waves (direction, not Wave 1):** draw-then-self-check with fewer guides → free-draw
challenges from a brief prompt. The web prototype's dot-to-dot ladder ([`PRD.md`](PRD.md)) is
demoted to an optional warm-up rather than the spine.

**Signals:** per-shape consistency (roundness, closure, proportion), tidy-correction magnitude,
smoothness/jitter, completion, persistence (undos), free-draw effort heuristics.

### 5.3 Reading (English-first)
**Objective:** systematic, structured phonics → early decoding and comprehension.

**Progression (adaptive, phonics scope-and-sequence):**
1. *Print & phonological awareness* — rhyme, syllables, initial sounds.
2. *Letter–sound correspondence* — single-letter phonemes.
3. *Blending* — CVC words (c-a-t → "cat").
4. *Digraphs & blends* — sh, ch, th, st, bl…
5. *Sight words & simple sentences* — high-frequency words, short decodable sentences.
6. *Comprehension* — answer a simple question about a read sentence.

**Signals:** phoneme accuracy, blending success, decoding speed, sight-word recall,
comprehension correctness. (Speech input is a candidate for later phases — see §13.5.)

### 5.4 Writing (English-first)
**Objective:** letter formation, legibility, and pre-writing motor skills; finger-first,
Pencil-enhanced.

**Progression (adaptive):**
1. *Pre-writing strokes* — lines, curves, zig-zags, loops.
2. *Letter tracing* — guided uppercase, then lowercase (correct start point & stroke order).
3. *Independent letters* — form letters with fading guides.
4. *Words* — copy/trace then write simple CVC words.
5. *Free writing* — write a word/name from memory or dictation.

**Signals:** stroke-order correctness, start-point accuracy, deviation from guide path,
legibility heuristic, completion, Pencil pressure/tilt (if available).

### 5.5 Cross-domain links (why this matters)
- Fine-motor control (Drawing §5.2) is the prerequisite engine for Writing (§5.4).
- Visual discrimination (Spatial §5.1) supports letter/word recognition in Reading (§5.3).
- The parent insight engine surfaces these links ("Strong fine-motor; ready for more
  letter-formation work").

---

## 6. Adaptive Learning Engine

**Goal:** keep each child in the zone of proximal development per domain.

- **Per-domain skill estimate.** Maintain a difficulty estimate per child per domain
  (and per sub-skill). Start from an onboarding calibration + age band, then update from
  performance.
- **Difficulty knobs.** Each activity exposes parameters (e.g., dot count & spacing for
  drawing; rotation angle for spatial; word length / phonics stage for reading; guide
  opacity & stroke tolerance for writing).
- **Adjustment policy (MVP).** Rule-based / lightweight Bayesian update: streak of successes
  → step up; repeated failure/frustration signals (rage-undo, abandonment, long latency) →
  step down and offer scaffolding.
- **Parent overrides.** Parents may pin a level, lock/unlock content, or set a focus domain
  (per §3.1 "Adaptive + parent controls" capability).
- **Future.** ML-based mastery modeling (e.g., Bayesian Knowledge Tracing / IRT) once enough
  anonymized data exists.

---

## 7. Measurement & Assessment Model  *(open decision — §3.2)*

**Recommended approach: embedded-by-play first, optional calibration check-ins.**

- **Embedded (primary).** Derive skill estimates passively from normal activities. No
  stressful "tests"; best for ages 3–7. Every activity emits structured signals (§5).
- **Calibration check-ins (optional, periodic).** Short, game-like sequences (e.g., monthly)
  that deliberately probe across a difficulty range to anchor the estimate and improve
  norm/percentile accuracy. Framed as "a special game," not a test.
- **Confidence & data sufficiency.** Insights show a confidence level; low-data states say
  "still getting to know your child" rather than showing a shaky percentile.

> Decision needed: confirm embedded-only vs. embedded + periodic check-ins before
> instrumenting the event schema (§14).

---

## 8. Parent App — Insight & Benchmarking

### 8.1 Core jobs-to-be-done
1. "Is my child developing on track?"
2. "How does my child compare to peers?"
3. "What should we focus on next?"
4. "Is screen time being well spent / is it safe?"

### 8.2 Key views
- **Child overview** — per-domain status (on track / emerging / ahead), trend over time.
- **Milestone view** — domain milestones achieved vs. expected for age (norm-based).
- **Peer percentile** — anonymized cohort percentile per domain, with explicit caveats and
  confidence.
- **Recommendations** — 1–3 concrete, plain-language next steps and offline activity ideas.
- **Activity log & time** — sessions, duration, engagement quality.
- **Controls** — screen-time limits, domain focus, level pinning, profile management.

### 8.3 Benchmarking design (norms + anonymized cohort)
- **Developmental norms (foundation).** Map each domain's signals to research-based early-
  childhood milestones/standards (candidate references: CDC developmental milestones, NAEYC
  guidance, common early-learning/phonics scope-and-sequence frameworks). *Specific datasets
  to be sourced/licensed — open item §3.2.* Norms work from day one with zero peer data.
- **Anonymized cohort percentile (enrichment).** Compute a child's percentile against
  aggregated, de-identified peers in the same age band. Requires a critical mass of users to
  be statistically meaningful; until then, show norms only and label cohort as "coming soon."
- **Privacy guarantees.** Cohort comparisons use only aggregate statistics; never expose any
  individual child's data; apply minimum-cohort-size thresholds (e.g., suppress percentiles
  below N children) and de-identification. See §12.
- **Tone.** Percentiles are framed supportively (ranges, not a single scary number) and never
  as a ranking/leaderboard. No competitive framing between real, identifiable children.

### 8.4 Account & profile model
- One parent account → 1..N child profiles.
- Parent-gated access (e.g., age-gate math challenge) to enter the Parent app / settings, per
  Apple Kids Category guidance.

---

## 9. Gamification & Engagement (Child app)

Carry forward and generalize the existing drawing reward system across all domains:
- **Stars** (1–3) for accuracy, persistence, creativity — per activity.
- **Sticker collection** that grows with completed activities.
- **Avatar / sticker book** the child decorates with earned rewards.
- **Daily challenge** rotating across unlocked domains/activities.
- **Progression / unlocks** as the child advances within a domain.

**Guardrails:** no dark patterns, no streak anxiety, no loot-box mechanics, no purchase
prompts shown to children. Rewards celebrate effort, not just correctness. Sessions are
intentionally short with gentle "good stopping point" cues to support healthy screen time.

---

## 10. Child UX Principles (ages 3–7)

- **Low text, high voice.** Audio instructions + clear iconography; never gate progress on
  reading ability (except inside the Reading domain itself).
- **Big targets, forgiving input.** Large hit areas, generous tolerances, no precise gestures.
- **One clear action per screen.** Minimal choices; obvious primary action.
- **No dead ends / no fail states.** Mistakes are gently redirected; encouragement over
  correction.
- **Calm aesthetics.** Soft colors, low sensory overload, predictable layouts.
- **Quick in, quick out.** Fast load to first interaction (<2s target).
- **Accessibility.** Dynamic Type where text exists, VoiceOver labels, sound on/off, color-
  blind-safe palettes, reduced-motion support, left/right-hand friendly layouts.

---

## 11. Functional Requirements (MVP)

### 11.1 Child app
- F-C1: Select/switch active child profile (parent-set; child taps an avatar).
- F-C2: Home screen surfacing today's recommended activities across unlocked domains.
- F-C3: Play activities in **Spatial**, **Drawing**, **Reading**, **Writing** (MVP subset — §15).
- F-C4: Adaptive difficulty per domain (§6).
- F-C5: Voice guidance at start/middle/end moments (reuse strategic cadence from prototype).
- F-C6: Earn stars/stickers; view sticker book/avatar.
- F-C7: Emit structured activity signals/events (§14) for measurement.
- F-C8: Work **offline**; sync when connected (§13.4).
- F-C9: Parent-gate before any settings/parent-only area.

### 11.2 Parent app (or parent mode)
- F-P1: Create account, add/manage child profiles (name, age/DOB, avatar).
- F-P2: Onboarding calibration per domain.
- F-P3: Child overview with per-domain status & trends (§8.2).
- F-P4: Milestone view vs. age norms (§8.3).
- F-P5: Peer percentile view (when cohort threshold met; else "coming soon").
- F-P6: Recommendations (1–3 next steps + offline ideas).
- F-P7: Controls: screen-time limits, domain focus, level pin/unlock.
- F-P8: Privacy center: view/export/delete child data; consent management (§12).
- F-P9: Weekly summary notification/email (opt-in).

---

## 12. Privacy, Safety & Compliance (first-class requirement)

- **Regulatory scope:** COPPA (US), GDPR-K / UK Age-Appropriate Design Code (EU/UK), and
  Apple's **Kids Category** requirements.
- **Verifiable parental consent** before collecting any child data; consent recorded and
  revocable.
- **Data minimization:** collect only what's needed to measure development; no precise
  geolocation; no contact info for children.
- **No third-party ads or behavioral tracking** in any child-facing surface. Restrict/avoid
  third-party SDKs in the Kids app per Apple policy.
- **De-identification** of all data used for cohort benchmarking; minimum cohort size
  thresholds before any percentile is shown (§8.3).
- **Parental rights:** access, export, and deletion of a child's data from the Parent app.
- **Security:** encryption in transit and at rest; least-privilege backend access; audited
  data flows.
- **Content safety:** all content curated/vetted; no open internet, no UGC sharing, no
  external links in the child app.

> A formal privacy review and data-protection assessment is a release gate before launch.

---

## 13. Technical Architecture

### 13.1 Client — iOS native, iPad-first
- Swift + SwiftUI (with UIKit/PencilKit where drawing/writing fidelity requires it).
- Single binary supporting both Child mode and Parent mode, **or** two apps sharing a core
  framework — decide during design (recommend one app with a parent-gated mode for MVP to
  simplify onboarding; revisit split if App Store Kids Category constraints require it).
- **Drawing/Writing canvas:** PencilKit / Metal-backed canvas; capture stroke geometry,
  timing, and (if Pencil) pressure/tilt.

### 13.2 Reuse from the web prototype
- The drawing **stage logic and template schema** (`stage`, `difficulty`, `guideType`,
  dot/anchor/ghost mechanics) are a proven model; port the *design*, reimplement natively.
- The **voice-cadence state machine** (start/middle/end) ports conceptually.
- The **analytics/event contract** generalizes into the event schema (§14).

### 13.3 Backend
- Services: auth/accounts, profile management, content/manifest delivery, event ingestion,
  measurement & norms engine, cohort-percentile aggregation, recommendations.
- Content delivered via a versioned **manifest** (per existing approach) so activities/levels
  can be added without app updates.
- Cohort aggregation runs as a batch/streaming job producing only aggregate statistics.

### 13.4 Offline & sync
- Child can play fully offline; activities and recent rewards cached.
- Events queue locally and sync opportunistically; conflict-free, append-only event log.

### 13.5 Speech (reading) — phased
- MVP: tap/selection-based reading checks (no mic).
- Later: on-device speech recognition for read-aloud/pronunciation, privacy permitting.

---

## 14. Data Model & Event Schema (sketch)

- **Entities:** ParentAccount, ChildProfile, Domain, Activity, Session, Event, SkillEstimate,
  Reward, NormReference, CohortStat.
- **Activity event (illustrative):**
  - `childId`, `profileAgeBandAtTime`
  - `domain` (spatial | drawing | reading | writing)
  - `activityId`, `difficulty`, `guideType` (drawing/writing)
  - `outcome` (completionRate, accuracy, errors, hintsUsed)
  - `timing` (duration, latencies)
  - `engagement` (undos, abandonment, frustration heuristics)
  - `rewards` (starsAwarded, stickersEarned)
  - `deviceContext` (pencilUsed?), `appVersion`, `timestamp`
- **Derived:** per-domain/sub-skill SkillEstimate (value + confidence); milestone attainment;
  cohort percentile (subject to min-N).

> Finalize after the §7 assessment decision; schema must be stable before content scales.

---

## 15. Release Scope — MVP → V1 → Future

### 15.1 MVP (first release) — prove the loop
- **Child app (iPad):** all four domains present but **shallow** —
  - Spatial: match/sort + patterns (levels 1–2).
  - Drawing: Stages 1–2 (connect dots, trace) — leverage existing ladder.
  - Reading: phonological awareness + letter–sound (levels 1–2).
  - Writing: pre-writing strokes + uppercase letter tracing (levels 1–2).
- Adaptive difficulty (rule-based), stars/stickers, offline play, voice guidance.
- **Parent app:** account + profiles, onboarding calibration, child overview, **norm-based**
  milestones, recommendations, screen-time control, privacy center. *(Cohort percentile =
  "coming soon" until data threshold met.)*
- Full privacy/compliance baseline (§12).

### 15.2 V1 (≈3–6 months later) — depth + benchmarking
- Complete domain ladders (Drawing Stages 3–5; deeper Spatial/Reading/Writing).
- **Anonymized cohort percentiles** activated once min-N reached.
- Weekly parent summaries; richer recommendations; Apple Pencil enhancements.
- Calibration check-ins (if chosen in §7).

### 15.3 Future / vision
- iPhone universal build; speech-based reading; ML mastery modeling (BKT/IRT).
- Additional domains (numeracy, social-emotional) — explicitly deferred now.
- Educator/multi-child dashboards; localization beyond English; family/sibling features.

---

## 16. Monetization  *(open decision — §3.2)*

Recommendation: **freemium subscription** — a meaningful free tier (a few activities per
domain + norm-based milestones) with a subscription unlocking full ladders, cohort
percentiles, and weekly insights. Rationale: funds ongoing content + the benchmarking data
pipeline; aligns with kids-ed norms. **Never** show purchase prompts to children — all
commerce lives behind the parent gate. Alternatives (one-time purchase, fully free/grant-
funded) remain open until owner decides.

---

## 17. Open Questions / Decisions Needed
1. **Monetization model** — pick (recommend freemium subscription, §16).
2. **Assessment capture** — embedded-only vs. embedded + periodic calibration (§7).
3. **One app vs. two apps** (parent-gated mode vs. separate Parent app) — §13.1.
4. **Apple Pencil** — optional (assumed) vs. required for writing fidelity.
5. **Norm dataset sourcing/licensing** — which standards back the milestones (§8.3).
6. **Cohort minimum-N threshold** and percentile presentation rules.
7. **Brand/name** — keep "Kids VanG" or rebrand for the broader platform.

---

## 18. Success Metrics (KPIs)
- **Activation:** % of new parents who complete onboarding + first child session.
- **Engagement quality:** sessions/week, completion rate, % sessions ended at a "good
  stopping point" (not abandonment).
- **Developmental signal:** measurable per-domain skill-estimate progress over 4–8 weeks.
- **Parent value:** weekly-summary open rate; recommendation follow-through; retention.
- **Trust/safety:** zero privacy incidents; consent completion rate; data-deletion honored.
- **Business (if monetized):** trial→paid conversion, subscription retention.

---

## 19. Risks & Mitigations
| Risk | Mitigation |
|---|---|
| Peer benchmarking is statistically weak early (sparse data) | Norms-first; gate cohort percentiles behind min-N; show confidence |
| Privacy/regulatory exposure (children's data) | Privacy-by-design, consent, de-identification, formal review gate (§12) |
| Measurement feels like testing → stress | Embedded-by-play; game-framed check-ins; no fail states |
| Over-scoping four domains at once | MVP keeps each domain shallow; depth in V1 |
| Adaptive engine mis-levels children | Conservative steps; parent overrides; frustration detection |
| Reading depth limited without speech input | Tap-based MVP; speech as a phased enhancement |
| App Store Kids Category rejection (SDKs/ads) | No 3rd-party tracking/ads; audit SDKs against Apple policy early |

---

## 20. Appendix
- **Glossary:** ZPD (zone of proximal development); CVC (consonant-vowel-consonant); phoneme;
  digraph; BKT (Bayesian Knowledge Tracing); IRT (Item Response Theory); min-N (minimum
  cohort size for a shown statistic).
- **Related docs:** [`PRD.md`](PRD.md) (drawing ladder), [`DEVELOPMENT_PLAN_V1.md`](DEVELOPMENT_PLAN_V1.md)
  (web prototype milestones).
- **References to source during design:** CDC developmental milestones; NAEYC early-learning
  guidance; an established phonics scope-and-sequence; early handwriting/letter-formation
  standards. (Specific datasets/licensing — open item §3.2.)
