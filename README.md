# Claude Certified Architect — Exam Prep Module

A complete, self-contained study and practice-exam module for the **Claude Certified
Architect (Foundations)** certification. The study material runs entirely in the browser
— no server, no build step. An **optional** Gemini-powered serverless endpoint adds
on-demand AI question generation (see `DEPLOY.md`); the app works fully without it.

---

## What's inside

- **Dashboard** — Exam-readiness gauge (weighted by official exam weighting), per-domain
  accuracy + coverage cards, a context-aware "next action" recommendation, and recent
  Mock/Real exam history. All driven by your own practice, stored locally.
- **Domains** — Deep-dive narrative for all 5 domains and 30 task statements: concepts,
  callouts (key / watch-out / tip), code, exam-focus, and quick reference.
- **Study Guide** — Per-topic concepts, anti-patterns, deep dives, code, comparisons,
  and exam tips for every task statement.
- **Anti-Patterns Cheatsheet** — 38 anti-patterns, filterable by severity and domain.
- **Scenarios** — All 6 exam-style scenarios with correct-vs-anti decisions.
- **Domain Quiz** — Drill one domain at a time, instant feedback with a rationale for
  *every* option. No-repeat within your seen pool; options shuffled each attempt.
  Optional **"✨ AI variant"** button generates a fresh scenario via Gemini.
- **Mock Exam** — Timed, weighted cross-domain exam with a per-domain breakdown.
- **Real Exam Simulation** — Full-length, real weighting (27/18/20/20/15), 72% pass
  mark, results-only at the end.
- **Flashcards** — Rapid recall drills.

---

## Domains & question bank

| Domain | Weight | Exam questions |
|--------|--------|----------------|
| 1. Agentic Architecture & Orchestration | 27% | 49 |
| 2. Tool Design & MCP Integration | 18% | 50 |
| 3. Claude Code Configuration & Workflows | 20% | 60 |
| 4. Prompt Engineering & Structured Output | 20% | 60 |
| 5. Context Management & Reliability | 15% | 60 |
| **Total** | **100%** | **279** |

Every question is scenario-based with four options and a per-option rationale (why the
correct answer is right and why each distractor is wrong).

---

## Quick start

The study app is just static files.

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

(Opening `index.html` directly mostly works, but a local server avoids `file://`
restrictions on some browsers.)

For the **optional Gemini AI generator** and Vercel deployment, see **`DEPLOY.md`**.

---

## How to study

The recommended path (also shown on the Dashboard):

1. **Read** each Domain deep-dive and the Study Guide — focus on the red anti-pattern callouts.
2. **Drill** each domain in the Domain Quiz; the per-option rationales reinforce the trap patterns.
3. **Walk through** the 6 Scenarios (the real exam samples 4 of them).
4. **Sit** a Mock Exam under time. Once consistently above 80%, take the **Real Exam
   Simulation** (72% pass mark).

The Dashboard's readiness gauge blends per-domain accuracy with coverage (weighted by
exam weighting), so a high score requires both breadth and correctness.

---

## Multi-user model

No backend. Each person types their **name** top-right; their progress (attempts, mock
history, flashcard stats, last-active view, and the exam "seen" pool) is stored under
that name in their browser's `localStorage`. Switching the name reloads that user's
progress. The **Reset** button wipes that user's progress and seen pools.

For a true server-backed multi-user history, replace the `loadJSON` / `saveJSON`
functions in `app.js` with calls to your own API — they're isolated in one place for this.

---

## File structure

```
Claude Architect/
├── index.html              # Single-page app shell
├── styles.css              # Design-token-based styling
├── app.js                  # Navigation, exam engine, dashboard, telemetry
├── package.json            # Only dependency: @google/generative-ai (for the API endpoint)
├── vercel.json             # Static hosting + security headers
├── DEPLOY.md               # Static + Gemini deployment guide
├── api/
│   └── generate-questions.js   # Optional Vercel serverless endpoint (Gemini 2.0 Flash)
└── data/
    ├── d1.js … d5.js           # Per-domain deep-dive + study guide + flashcards
    ├── exam-d1.js … exam-d5.js # Per-domain scenario question banks (279 total)
    ├── antipatterns.js         # 38 anti-patterns
    └── scenarios.js            # 6 exam scenarios
```

Data is loaded as plain `window.*` globals via `<script>` tags (no module system).
`window.EXAM_BANK.D1…D5` holds the question banks; `window.DOMAIN_DEEPDIVE`,
`window.STUDY_CONTENT`, `window.FLASHCARDS`, `window.ANTI_PATTERNS`, and
`window.SCENARIOS` hold the rest.

---

## Customisation

- **Add questions**: append to the relevant `data/exam-d*.js` array. Each item needs
  `id`, `source` (`"sim"`/`"extra"`/`"ai"`), `domain`, `topic`, `topicTitle`,
  `question`, `options` (4), `answer` (0-based index), `rationales` (4).
- **Mock/Real weighting**: `EXAM_WEIGHTS` in `app.js`.
- **Pass mark**: `REAL_EXAM_PASS_MARK` in `app.js` (default 0.72).
- **AI generator model**: `GEMINI_MODEL` env var (default `gemini-2.0-flash`).
- **Theme**: CSS custom properties at the top of `styles.css`.

---

## License & disclaimer

Independent study material. Not endorsed by, affiliated with, or sponsored by Anthropic.
