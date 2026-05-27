# Deployment & Gemini AI Setup

This is a **static** exam-prep site (`index.html` + `app.js` + `styles.css` + `data/*.js`)
with **one optional serverless endpoint** (`api/generate-questions.js`) that generates
fresh practice questions on demand via the Gemini API.

The site works fully without the endpoint — the "✨ AI variant" button in the Domain
Quiz simply falls back to the static question bank if the endpoint isn't deployed or the
API key is missing. The AI generator is purely additive.

---

## 1. Static-only (no AI) — zero setup

Serve the folder with any static host. Locally:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

On Vercel, the existing `vercel.json` already handles static hosting and headers.
Nothing else is required for the full study guide, 279-question bank, quizzes, and
mock/real exam modes.

---

## 2. Enable the Gemini "AI variant" generator

The endpoint lives at `api/generate-questions.js` and is auto-discovered by Vercel as a
serverless function. It calls **Gemini 2.0 Flash** (chosen for cost: ~10x cheaper than
comparable Claude Sonnet usage for this short structured-JSON task; ~US$0.0004 per
generated question at current Flash pricing).

### 2a. Get a Gemini API key

1. Go to <https://aistudio.google.com/app/apikey>.
2. Create an API key on a project with billing enabled.
3. Copy the key (starts with `AIza…`).

### 2b. Install the dependency

```bash
npm install          # installs @google/generative-ai (see package.json)
```

`node_modules/` is gitignored — Vercel runs `npm install` for you on deploy, so you only
need this locally if you want to test with `vercel dev`.

### 2c. Set the key on Vercel (server-side only — never shipped to the browser)

```bash
vercel env add GEMINI_API_KEY        # paste the key when prompted; choose Production (and Preview/Development if you want)
# optional model override (defaults to gemini-2.0-flash):
vercel env add GEMINI_MODEL          # e.g. gemini-2.0-flash
```

Or via the dashboard: **Project → Settings → Environment Variables**
add `GEMINI_API_KEY` = your key.

### 2d. Deploy

```bash
vercel --prod
```

### 2e. Verify it works

- Open the deployed site → **Domain Quiz** → start a drill on any loaded domain →
  answer a question → click **"✨ AI variant →"**.
- A freshly generated scenario question should appear (shuffled options, full
  per-option rationales). If the key is missing or quota is hit, you'll see a small
  amber banner and the app advances to the next static question instead — by design.

Quick endpoint smoke test (replace the host):

```bash
curl -s -X POST https://YOUR-DEPLOYMENT.vercel.app/api/generate-questions \
  -H 'Content-Type: application/json' \
  -d '{"domain":"D1","topic":"d1.1","topicTitle":"Agentic Loops","styleRef":[]}' | head -c 600
```

A `200` with a JSON body containing `question`, `options` (4), `answer`, and
`rationales` (4) means it's live. A `500` with `"GEMINI_API_KEY is not configured"`
means the env var hasn't propagated — redeploy after adding it.

---

## 3. Local testing of the endpoint (optional)

```bash
npm install
GEMINI_API_KEY=AIza... vercel dev      # serves the static site + /api locally
```

Then exercise the AI-variant button at `http://localhost:3000`.

---

## Cost & safety notes

- **The key never reaches the browser.** It lives only in the serverless runtime
  environment. The client calls `/api/generate-questions`, which calls Gemini.
- The endpoint is **POST-only**, validates all inputs, caps the style-reference size,
  and returns **429** on quota/rate-limit so the client can fall back cleanly.
- Gemini 2.0 Flash with `responseMimeType: "application/json"` + a response schema means
  no fragile output parsing — malformed responses are rejected with a 400.
- To cap spend, set a budget alert on the Google Cloud billing account, and/or restrict
  the API key to the Generative Language API in the Google AI Studio / Cloud console.
