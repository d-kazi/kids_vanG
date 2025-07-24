**Interactive Dot‑to‑Dot Drawing App with AI Companion**

---

## Project Overview

Create a lightweight, web‑based proof‑of‑concept that lets young children (ages 3–6) trace dot‑to‑dot templates on an iPad, with real‑time visual guidance and generative‑AI voice encouragement. Parents can invite testers via email, swap among pre‑loaded templates (smiley face, child’s face, superhero mask), and gather initial feedback on engagement and usability.

---

## Level

Easy to Medium

---

## Type of Project

EdTech, Web App, AI‑Enhanced Interactive Experience

---

## Skills Required

* HTML5 & CSS for responsive layout
* JavaScript (canvas or p5.js) for touch drawing
* Basic AI integration (OpenAI or similar)
* Simple access control (email‑link invites)
* UX design for preschool usability

---

## Key Features

| Milestone | Feature Area               | Description                                                                                                                       |
| --------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **1**     | Dot‑to‑Dot Engine          | Render JSON‑driven dot templates; detect taps within a configurable radius; draw connecting lines.                                |
| **2**     | Visual Guidance            | Highlight the “next” dot in a bright accent color; mark completed dots distinctly; support “undo.”                                |
| **3**     | AI Voice Encouragement     | After each successful line, call a lightweight AI endpoint to generate a 1–2 sentence praise and speak it via the Web Speech API. |
| **4**     | Template Management        | Load and switch among three starter templates—simple smiley, child’s portrait, superhero mask—via UI controls or URL parameter.   |
| **5**     | Invite‑Only Access Control | Require email‑link authentication before loading the canvas; allow parent to whitelist tester emails.                             |
| **6**     | UX Polish & Analytics      | Add “undo” button, progress indicator (e.g. “3 of 10 dots”), and basic usage logging for iteration.                               |

---

## Client Information

Target users are children **ages 3–6** who are just beginning to learn drawing fundamentals—shape recognition, hand‑eye coordination, and basic line control—through fun, guided dot‑to‑dot activities with friendly AI encouragement. 