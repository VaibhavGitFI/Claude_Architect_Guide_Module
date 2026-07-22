/*
 * One-time content migration: extracts the exam-prep data from the original
 * v1 static app (v1/data/*.js, loaded as window.* globals) into JSON files
 * consumed by the Next.js app (lib/data/**).
 *
 * ZERO CONTENT REWRITING. This script does not touch, retype, paraphrase, or
 * regenerate any question, rationale, or study-guide text. It only:
 *   1. Shims `window` so the original files run unmodified under Node.
 *   2. require()s them in the exact order v1/index.html loads them.
 *   3. Serializes the resulting window.* globals to JSON.
 *   4. Assigns a stable id to each flashcard (source app.js keyed
 *      flashStats by array index — a pre-existing app-logic bug, not
 *      content; this fixes it mechanically, not editorially).
 *
 * Run: node scripts/migrate-data.cjs
 * Then verify with: node scripts/verify-migration.cjs
 */
const fs = require("fs");
const path = require("path");

const V1_DATA = path.join(__dirname, "..", "v1", "data");
const OUT = path.join(__dirname, "..", "lib", "data");

// Shim the browser global these files expect.
global.window = {};

const LOAD_ORDER = [
  "antipatterns.js",
  "scenarios.js",
  "d1.js",
  "d2.js",
  "d3.js",
  "d4.js",
  "d5.js",
  "exam-d1.js",
  "exam-d2.js",
  "exam-d3.js",
  "exam-d4.js",
  "exam-d5.js",
];

// v1's flashcard objects carry no domain field (window.FLASHCARDS is a flat
// array each d{n}.js appends to via Array.prototype.push.apply). We recover
// the domain deterministically — not by guessing — by recording how many
// cards window.FLASHCARDS holds immediately before and after each d{n}.js
// require() call; the delta is exactly that domain's cards, in order.
window.FLASHCARDS = [];
const flashcardDomainRanges = []; // [{domain, start, end}]
for (const file of LOAD_ORDER) {
  const before = window.FLASHCARDS.length;
  require(path.join(V1_DATA, file));
  const after = window.FLASHCARDS.length;
  const m = /^d([1-5])\.js$/.exec(file);
  if (m && after > before) {
    flashcardDomainRanges.push({ domain: "D" + m[1], start: before, end: after });
  }
}

const w = global.window;

function writeJSON(relPath, data) {
  const full = path.join(OUT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("wrote", relPath);
}

// ---- Anti-patterns + scenarios (flat arrays) ----
writeJSON("anti-patterns.json", w.ANTI_PATTERNS || []);
writeJSON("scenarios.json", w.SCENARIOS || []);

// ---- Per-domain deep-dive / study-content / exam-bank ----
const DOMAINS = ["D1", "D2", "D3", "D4", "D5"];
for (const d of DOMAINS) {
  const key = d.toLowerCase();
  writeJSON(`domain-deepdive/${key}.json`, (w.DOMAIN_DEEPDIVE || {})[d] || null);
  writeJSON(`study-content/${key}.json`, (w.STUDY_CONTENT || {})[d] || null);
  writeJSON(`exam-bank/${key}.json`, (w.EXAM_BANK || {})[d] || []);
}

// ---- Flashcards: assign a stable id + derived domain (mechanical, not editorial) ----
// v1 keys flashStats by array INDEX, which breaks if cards are ever reordered
// or filtered — an app-logic bug, not content, so we fix it here: each card
// gets a deterministic id `d{n}-fc-{i}` from the domain range captured above.
function domainForIndex(i) {
  const r = flashcardDomainRanges.find((r) => i >= r.start && i < r.end);
  return r ? r.domain : null;
}
const flatFlashcards = w.FLASHCARDS || [];
const flashcardsWithIds = flatFlashcards.map((c, i) => {
  const domain = domainForIndex(i);
  const within = domain
    ? i - flashcardDomainRanges.find((r) => r.domain === domain).start + 1
    : i + 1;
  return {
    id: domain ? `${domain.toLowerCase()}-fc-${within}` : `fc-${i + 1}`,
    domain,
    front: c.front,
    back: c.back,
  };
});
writeJSON("flashcards.json", flashcardsWithIds);

// ---- Lightweight summary (pool sizes only) so pages like the Dashboard
// that just need counts don't have to import the full per-domain question
// banks (with all option/rationale text) into their client bundle. ----
const examBankCounts = {};
DOMAINS.forEach((d) => {
  examBankCounts[d] = ((w.EXAM_BANK || {})[d] || []).length;
});
writeJSON("summary.json", {
  examBankCounts,
  totalQuestions: Object.values(examBankCounts).reduce((a, b) => a + b, 0),
  antiPatternsCount: (w.ANTI_PATTERNS || []).length,
  scenariosCount: (w.SCENARIOS || []).length,
  flashcardsCount: flashcardsWithIds.length,
});

console.log("\nDone. Counts:");
console.log("  anti-patterns:", (w.ANTI_PATTERNS || []).length);
console.log("  scenarios:", (w.SCENARIOS || []).length);
console.log("  flashcards:", flashcardsWithIds.length);
DOMAINS.forEach((d) => {
  console.log(`  exam-bank.${d}:`, ((w.EXAM_BANK || {})[d] || []).length);
});
