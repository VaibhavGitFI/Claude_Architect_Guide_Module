# Claude Certified Architect — Exam Prep Module

A complete, self-contained study and practice exam module for the **Claude Certified Architect** certification. Runs entirely in the browser — no server, no build step, no dependencies.

---

## What's inside

- **Dashboard** — Progress stats, domain mastery bars, recommended study path, domain weighting.
- **Study Guide** — All 5 domains, 18 topics, with concepts, anti-patterns, deep dives, code, comparisons, and exam tips.
- **Anti-Patterns Cheatsheet** — All 18 anti-patterns filterable by severity and domain.
- **Scenarios** — Deep dive into all 6 exam scenarios (the exam picks 4 randomly).
- **Domain Quiz** — Drill questions per domain (or mixed) with instant feedback and explanations.
- **Mock Exam** — Timed, weighted, randomized exam with per-domain breakdown.
- **Flashcards** — Rapid recall drills with knew/missed tracking.

---

## Domains covered (with weights)

| Domain | Weight | Topics |
|--------|--------|--------|
| 1. Agentic Architecture & Orchestration | ~25% | Agentic loops, multi-agent, hooks, sessions |
| 2. Tool Design & MCP Integration | ~20% | Descriptions, errors, distribution, MCP, built-ins |
| 3. Claude Code Configuration & Workflows | ~20% | CLAUDE.md, commands, plan mode, CI/CD |
| 4. Prompt Engineering & Structured Output | ~20% | Criteria, few-shot, tool_use, validation |
| 5. Context Management & Reliability | ~15% | Case facts, escalation, provenance |

---

## Quick start (any machine)

The module is just static files. Open `index.html` and you're done.

### Option 1 — Open directly
```bash
# macOS
open index.html
# Linux
xdg-open index.html
# Windows
start index.html
```

> Some browsers restrict file:// access for inline scripts. If anything doesn't load, use Option 2.

### Option 2 — Local web server (recommended)
```bash
# Python 3 (almost always installed)
python3 -m http.server 8080
# then open: http://localhost:8080

# Node.js
npx serve .

# PHP
php -S localhost:8080
```

---

## Deploy to the web (multi-user)

This is a pure static site — drop it on any host. Each visitor's progress is saved in their own browser via `localStorage`, keyed by the username they enter at the top right.

### GitHub Pages
1. Push this folder to a GitHub repo.
2. Settings → Pages → Branch: `main` → `/ (root)` → Save.
3. Share the published URL.

### Netlify (drag and drop)
1. Open https://app.netlify.com/drop
2. Drag the folder containing `index.html`.
3. Share the published URL.

### Vercel
```bash
npx vercel deploy --prod
```

### S3 / CloudFront / Cloudflare Pages / any static host
Just upload all files preserving the folder structure (`index.html`, `styles.css`, `app.js`, `data/*.js`).

---

## How to study with this module

The recommended path (also shown on the Dashboard):

1. **Read** every topic in the Study Guide. Pay extra attention to the red "Anti-Patterns to Avoid" boxes.
2. **Quiz** per domain to verify recall — review every explanation carefully.
3. **Walk through** all 6 Scenarios. The exam picks 4 of them.
4. **Drill** the Anti-Patterns Cheatsheet — fastest way to eliminate distractors.
5. **Sit** the Mock Exam (40 questions, 60 minutes, no explanations) under realistic conditions. Aim for 80%+.

Repeat the Mock Exam with different settings until you're consistently scoring 80%+ across all five domains. The exam's passing line is at 80%.

---

## Multi-user model

There is no backend. Multi-user means:
- Each person types their **name** in the top-right field.
- Their progress (attempts, mock history, flashcard stats) is stored under that name in their browser's `localStorage`.
- Switching the name reloads progress for that user.
- A "Reset" button wipes that user's progress.

For a true multi-user-with-history backend, you would replace the `loadJSON`/`saveJSON` functions in `app.js` with calls to your own API. The functions are isolated in one place specifically for this.

---

## File structure

```
Claude Architect/
├── index.html              # Single-page app shell
├── styles.css              # All styling
├── app.js                  # Navigation, quiz engine, mock exam, flashcards
├── data/
│   ├── content.js          # Full study guide (all 5 domains, 18 topics)
│   ├── antipatterns.js     # 18 anti-patterns
│   ├── scenarios.js        # 6 exam scenarios
│   ├── questions.js        # Practice question bank (~100 Qs)
│   └── flashcards.js       # Flashcard deck
└── README.md               # This file
```

Total weight: under 200KB, no external CDN calls, no fonts loaded.

---

## Customisation

- **Add questions**: Append to `data/questions.js`. Each item needs `id`, `domain` (D1-D5), `topic`, `q`, `options`, `answer` (index), `explain`.
- **Tune mock weights**: In `app.js`, search for `const weights = { D1: 0.25, ... }`.
- **Pass threshold**: Search for `pct >= 80` in `app.js`.
- **Theme**: All colors and spacing live in `styles.css`.

---

## Browser support

Modern browsers (Chrome, Safari, Firefox, Edge 2020+). Uses `localStorage` and standard DOM APIs only — no ES2022+ syntax, no module loading.

---

## License & disclaimer

This module is independent study material. It is not endorsed by, affiliated with, or sponsored by Anthropic.
