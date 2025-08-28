## Product Requirements Document (PRD): Kids VanG – MVP → V1

### Vision
Guided drawing experiences that scale from connecting dots to free drawing, building confidence, control, and creativity.

### Content Roadmap: MVP → V1 Rollout

#### Stage 1: Connect the Dots (Hook, Ages 3–4)
- **Goal**: engagement, sequencing, basic control
- **Template count**: 10–12
- **Examples**: basic shapes (circle, triangle, square, star); simple objects (balloon, sun, ice cream, car); animals (fish, butterfly)
- **Difficulty scaling**: 5 → 15 dots

#### Stage 2: Trace Over Dots (Motor Control, Ages 4–5)
- **Goal**: smooth curves, control of hand movement
- **Template count**: 12–15
- **Examples**: faces (smiley, cat face, clown face); objects with curves (moon, rainbow, flower, snail shell); vehicles (boat, rocket, train engine)
- **Scaling**: dotted outlines with 20–30 dots, closer spacing

#### Stage 3: Partial Dots (Guided Imagination, Ages 5)
- **Goal**: draw between anchor points, build curves freehand
- **Template count**: 8–10
- **Examples**: animals (dog, cat, elephant); characters (superhero mask, princess crown); scenes (house with tree, castle, playground slide)
- **Scaling**: fewer but strategically placed dots

#### Stage 4: Ghost/Fading Guides (Independence, Ages 5–6)
- **Goal**: memory + confidence in finishing lines
- **Template count**: 6–8
- **Examples**: dinosaur outline; rocket + stars; dragon or unicorn; complex face (with eyes/nose placement hints)
- **Scaling**: ghost outlines fade as drawing progresses

#### Stage 5: Free‑Draw Challenge (Creativity, Ages 6+)
- **Goal**: independent drawing from memory
- **Template count**: 5–6 starter challenges
- **Examples**: “Draw a rocket blasting off” (show for 5 sec, hide); “Draw your favorite pet”; “Draw a superhero with a cape”
- **Scaling**: open‑ended; reward effort with AI praise + stickers

### Gamification Layer
- **Progression path**: stages unlock after X templates completed (e.g., 5 drawings per stage)
- **Stars**: 1–3 stars for accuracy, persistence, or creativity
- **Stickers**: collection grows with each finished drawing
- **Daily Challenge Mode**: rotates across unlocked stages for variety
- **Avatar/Book**: decorate a digital book or avatar with earned stickers

### Release Scope
- **MVP (first release)**: ~20 templates → 10 Stage 1, 10 Stage 2
- **V1 (3–6 months later)**: full ladder → ~45–50 templates across all 5 stages

### Non‑Goals (for this phase)
- Networked multiplayer, real‑time collaboration
- Complex account management beyond invite token
- AI image generation

### Acceptance Criteria (per stage)
- Stage definitions and counts present in content manifest
- Each template loads with correct dot logic matching its stage type
- Voice feedback limited to start/middle/end moments
- Session logs record stage, template id, completion rate, duration
- Admin dashboard aggregates per‑stage usage

### Technical Notes
- Reuse current HTML5 Canvas engine; extend to support: dotted tracing (Stage 2), partial anchors (Stage 3), ghost guides (Stage 4), free‑draw mode (Stage 5)
- Template schema: add `stage`, `difficulty`, and `guideType` fields per template
- Analytics: add fields `stage`, `starsAwarded`, `stickersEarned`

### For further work
- Authoring pipeline for batch‑creating templates across stages
- Parental controls and progress profiles per child
- Localization of prompts and stickers
- Offline caching of templates and assets
- A/B tests for voice cadence and reward frequency


