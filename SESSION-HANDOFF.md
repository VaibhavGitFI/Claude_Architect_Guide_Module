# Session Handoff — Claude Certified Architect Exam Prep

> Status snapshot for resuming work. Last updated: 2026-05-27.

## Current status: COMPLETE & WORKING

A static, vanilla-JS exam-prep app for the **Claude Certified Architect (Foundations)**
exam, rebuilt end-to-end from the reference content at claudecertificationguide.com.
Plus an optional Gemini serverless endpoint for AI question generation.

- **Stack:** `index.html` + `app.js` (one IIFE) + `styles.css` + `data/*.js` (globals).
  Optional `api/generate-questions.js` (Vercel serverless, `@google/generative-ai`).
- **Run locally:** `python3 -m http.server 8080` → `http://localhost:8080`.
- **Deploy / AI setup:** see `DEPLOY.md`.
- **Persistence:** per-user `localStorage` under the `cca_prep::` prefix.

## What's built (all verified, `node --check` clean, serves 200)

| Area | State |
|------|-------|
| 5 domains: deep-dive + study guide + flashcards | `data/d1.js … d5.js` |
| Exam bank: **279** scenario questions, per-option rationales | `data/exam-d1.js … exam-d5.js` (D1 49, D2 50, D3 60, D4 60, D5 60) |
| Exam engine: Domain Quiz / Mock Exam / Real Exam Simulation | no-repeat seen-pool, option shuffle, weighted draw, pass mark 72% |
| Dashboard | readiness gauge, per-domain accuracy+coverage cards, next-action, recent activity; telemetry wired (`logAttempt`, `logMockResult`) |
| Anti-patterns (**38**) + scenarios (**6**) | audited & corrected against rebuilt content |
| Visual design | design tokens, animations, per-domain colours, keyboard shortcuts (1-4, N, ←/→) |
| Reload behaviour | restores last-active view via `cca_prep::_lastView` |
| Gemini AI variant | `api/generate-questions.js` + "✨ AI variant" button in Domain Quiz (graceful static fallback) |

## Exam weights (authoritative, used by the engine)
D1 **27%** · D2 **18%** · D3 **20%** · D4 **20%** · D5 **15%**.

## Key globals (loaded before app.js)
- `window.DOMAIN_DEEPDIVE.D1..D5` — Domains view
- `window.STUDY_CONTENT.D1..D5` — Study Guide view
- `window.FLASHCARDS` — Flashcards (appended per domain)
- `window.EXAM_BANK.D1..D5` — exam engine question banks
- `window.ANTI_PATTERNS`, `window.SCENARIOS` — cheatsheet + scenarios
- Note: the legacy `window.QUESTIONS` global is unused by the rebuilt engine.

## Question schema (exam-d*.js)
```js
{ id, source:"sim"|"extra"|"ai", domain:"D1", topic:"d1.3", topicTitle,
  question, options:[4], answer: 0-3 /* pre-shuffle */, rationales:[4] }
```
Engine shuffles options per attempt and permutes `answer` + `rationales` in lockstep.

## AI generator seam
`window.ExamEngine` is the single boundary. The "✨ AI variant" button POSTs to
`/api/generate-questions` (Gemini 2.0 Flash, JSON-schema output). Falls back to the
static bank on any error/quota. Needs `GEMINI_API_KEY` on Vercel — see `DEPLOY.md`.

## Optional follow-ups (not started)
- Per-task-statement weakness breakdown on domain-card click.
- Export / import progress (move between devices).
- Bulk offline question generation to grow the static bank.
- 7-day activity sparkline on the dashboard.
