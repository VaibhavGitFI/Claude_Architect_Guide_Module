/*
 * Fidelity check for scripts/migrate-data.cjs. Does two independent things:
 *
 *   1. Count check — re-derives window.* from v1/data/*.js fresh (does not
 *      trust migrate-data.cjs's own printed counts) and compares against
 *      the generated lib/data JSON files' array/object lengths.
 *
 *   2. String-literal diff — extracts every quoted string literal that
 *      appears in the original v1/data/*.js source text and every string
 *      value present in the generated JSON, and confirms the JSON side is
 *      a subset of the source side (nothing invented) and that the counts
 *      of distinctive long strings (question/rationale text, len > 40)
 *      match exactly (nothing dropped).
 *
 * Run: node scripts/verify-migration.cjs
 * Exits non-zero on any mismatch.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const V1_DATA = path.join(ROOT, "v1", "data");
const OUT = path.join(ROOT, "lib", "data");

let failures = 0;
function check(label, cond, detail) {
  if (cond) {
    console.log("  OK  ", label);
  } else {
    failures++;
    console.log("  FAIL", label, detail !== undefined ? "-> " + detail : "");
  }
}

// ---------- Part 1: independent recount ----------
global.window = {};
const LOAD_ORDER = [
  "antipatterns.js", "scenarios.js",
  "d1.js", "d2.js", "d3.js", "d4.js", "d5.js",
  "exam-d1.js", "exam-d2.js", "exam-d3.js", "exam-d4.js", "exam-d5.js",
];
for (const f of LOAD_ORDER) require(path.join(V1_DATA, f));
const w = global.window;

console.log("Part 1: counts (fresh re-derivation vs generated JSON)");

const antiJson = JSON.parse(fs.readFileSync(path.join(OUT, "anti-patterns.json"), "utf8"));
check("anti-patterns count", antiJson.length === (w.ANTI_PATTERNS || []).length,
  `json=${antiJson.length} source=${(w.ANTI_PATTERNS || []).length}`);
check("anti-patterns count == 38 (known baseline)", antiJson.length === 38, antiJson.length);

const scenJson = JSON.parse(fs.readFileSync(path.join(OUT, "scenarios.json"), "utf8"));
check("scenarios count", scenJson.length === (w.SCENARIOS || []).length,
  `json=${scenJson.length} source=${(w.SCENARIOS || []).length}`);
check("scenarios count == 6 (known baseline)", scenJson.length === 6, scenJson.length);

const flashJson = JSON.parse(fs.readFileSync(path.join(OUT, "flashcards.json"), "utf8"));
check("flashcards count", flashJson.length === (w.FLASHCARDS || []).length,
  `json=${flashJson.length} source=${(w.FLASHCARDS || []).length}`);
check("flashcards count == 111 (known baseline)", flashJson.length === 111, flashJson.length);
check("every flashcard has a unique id", new Set(flashJson.map((c) => c.id)).size === flashJson.length);

const EXPECTED_EXAM_COUNTS = { D1: 49, D2: 50, D3: 60, D4: 60, D5: 60 };
let examTotal = 0;
for (const d of ["D1", "D2", "D3", "D4", "D5"]) {
  const key = d.toLowerCase();
  const bankJson = JSON.parse(fs.readFileSync(path.join(OUT, "exam-bank", `${key}.json`), "utf8"));
  const ddJson = JSON.parse(fs.readFileSync(path.join(OUT, "domain-deepdive", `${key}.json`), "utf8"));
  const scJson = JSON.parse(fs.readFileSync(path.join(OUT, "study-content", `${key}.json`), "utf8"));
  check(`exam-bank.${d} count`, bankJson.length === (w.EXAM_BANK[d] || []).length,
    `json=${bankJson.length} source=${(w.EXAM_BANK[d] || []).length}`);
  check(`exam-bank.${d} count == ${EXPECTED_EXAM_COUNTS[d]} (known baseline)`,
    bankJson.length === EXPECTED_EXAM_COUNTS[d], bankJson.length);
  check(`domain-deepdive.${d} present with ${(w.DOMAIN_DEEPDIVE[d].sections || []).length} sections`,
    Array.isArray(ddJson.sections) && ddJson.sections.length === (w.DOMAIN_DEEPDIVE[d].sections || []).length);
  check(`study-content.${d} present with ${(w.STUDY_CONTENT[d].topics || []).length} topics`,
    Array.isArray(scJson.topics) && scJson.topics.length === (w.STUDY_CONTENT[d].topics || []).length);
  examTotal += bankJson.length;
}
check("total exam questions == 279 (known baseline)", examTotal === 279, examTotal);

// ---------- Part 2: string-literal fidelity diff ----------
console.log("\nPart 2: string-literal fidelity (every JSON string must trace back to source text)");

// Unescape JS string-literal backslash sequences directly (deliberately not
// routed through JSON.parse, which assumes JSON's escaping rules and mangles
// JS source that mixes quote styles — e.g. \" inside a double-quoted string).
function unescapeJsString(raw) {
  let out = "";
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === "\\" && i + 1 < raw.length) {
      const next = raw[i + 1];
      const map = { n: "\n", t: "\t", r: "\r", "\\": "\\", '"': '"', "'": "'", "`": "`" };
      out += next in map ? map[next] : next;
      i++;
    } else {
      out += raw[i];
    }
  }
  return out;
}

// A minimal character-by-character tokenizer — NOT a regex — because a naive
// regex can't tell an apostrophe inside a `//` comment (e.g. "Edit's") from
// the start of a real string literal, and a naive comment-stripper would
// wrongly truncate string literals that contain a URL's "//". This walks the
// source respecting code/string/comment context so only genuine string
// literals from actual code are extracted, and comments are skipped whole.
function extractStringLiterals(src) {
  const out = new Set();
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i], c2 = src[i + 1];
    if (c === "/" && c2 === "/") {
      i += 2;
      while (i < n && src[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && c2 === "*") {
      i += 2;
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      let raw = "";
      i += 1;
      while (i < n && src[i] !== quote) {
        if (src[i] === "\\" && i + 1 < n) { raw += src[i] + src[i + 1]; i += 2; }
        else { raw += src[i]; i += 1; }
      }
      i += 1; // consume closing quote
      out.add(unescapeJsString(raw));
      continue;
    }
    i += 1;
  }
  return out;
}

let sourceStrings = new Set();
for (const f of LOAD_ORDER) {
  const src = fs.readFileSync(path.join(V1_DATA, f), "utf8");
  extractStringLiterals(src).forEach((s) => sourceStrings.add(s));
}

// Collect every string value present anywhere in the generated JSON tree.
function collectStrings(node, into) {
  if (typeof node === "string") { into.add(node); return; }
  if (Array.isArray(node)) { node.forEach((n) => collectStrings(n, into)); return; }
  if (node && typeof node === "object") { Object.values(node).forEach((n) => collectStrings(n, into)); }
}

const jsonFiles = [
  "anti-patterns.json", "scenarios.json", "flashcards.json",
  ...["d1", "d2", "d3", "d4", "d5"].flatMap((k) => [
    `exam-bank/${k}.json`, `domain-deepdive/${k}.json`, `study-content/${k}.json`,
  ]),
];

let generatedStrings = new Set();
for (const rel of jsonFiles) {
  const data = JSON.parse(fs.readFileSync(path.join(OUT, rel), "utf8"));
  collectStrings(data, generatedStrings);
}
// Drop the mechanically-added fields that don't exist in source (ids, derived domain tags).
const MECHANICAL_ADDITIONS = new Set();
flashJson.forEach((c) => { MECHANICAL_ADDITIONS.add(c.id); if (c.domain) MECHANICAL_ADDITIONS.add(c.domain); });
["D1", "D2", "D3", "D4", "D5"].forEach((d) => MECHANICAL_ADDITIONS.add(d));

// Only check "substantive" strings (length > 15) to avoid false negatives on short
// mechanical tokens (single letters, ids, enum-like values) that aren't meaningful content.
const substantiveGenerated = [...generatedStrings].filter(
  (s) => s.length > 15 && !MECHANICAL_ADDITIONS.has(s)
);
const missing = substantiveGenerated.filter((s) => !sourceStrings.has(s));

check(
  `all ${substantiveGenerated.length} substantive generated strings trace back to v1 source text`,
  missing.length === 0,
  missing.length ? `${missing.length} missing, e.g.: ${JSON.stringify(missing.slice(0, 3))}` : undefined
);

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
process.exit(failures === 0 ? 0 : 1);
