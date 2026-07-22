/*
 * Direct port of the ExamEngine IIFE from v1/app.js. Same algorithms
 * (Fisher-Yates shuffle, seen-pool exclusion with wrap-on-depletion,
 * weighted-by-domain pull with top-up, option/answer/rationale
 * permutation) — not reinvented, just de-DOM-coupled so it works as
 * plain functions instead of reading a DOM input for the username.
 */
import { DOMAINS, EXAM_WEIGHTS, STORAGE_PREFIX } from "./constants";

function storageKey(user, name) {
  return `${STORAGE_PREFIX}${user}::${name}`;
}

function seenKey(user, mode) {
  return storageKey(user, `exam::seen::${mode}`);
}

export function getSeen(user, mode) {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(seenKey(user, mode)) || "[]"));
  } catch {
    return new Set();
  }
}

function saveSeen(user, mode, set) {
  if (typeof window === "undefined") return;
  localStorage.setItem(seenKey(user, mode), JSON.stringify(Array.from(set)));
}

export function markSeen(user, ids, mode) {
  const s = getSeen(user, mode);
  ids.forEach((id) => s.add(id));
  saveSeen(user, mode, s);
}

export function resetSeen(user, mode) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(seenKey(user, mode));
}

function filterBySource(bank, sourceFilter) {
  if (!sourceFilter || sourceFilter === "all") return bank;
  return bank.filter((q) => q.source === sourceFilter);
}

export function poolStatus(examBank, domain, user, mode, sourceFilter) {
  const bank = filterBySource(examBank[domain] || [], sourceFilter);
  const seen = getSeen(user, mode);
  const remaining = bank.filter((q) => !seen.has(q.id)).length;
  return { total: bank.length, seen: bank.length - remaining, remaining };
}

// Fisher-Yates. Takes an injectable RNG (default Math.random) so callers can
// pass a seeded generator in tests.
export function shuffle(arr, rng = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pull N from one domain, excluding seen. If the remaining pool is smaller
// than N, wrap: reset the seen-set, blend leftover+fresh, mark depleted:true
// so the UI can show a banner.
export function pullFromDomain(examBank, domain, n, user, mode, sourceFilter, rng = Math.random) {
  const bank = filterBySource(examBank[domain] || [], sourceFilter);
  let seen = getSeen(user, mode);
  const pool = bank.filter((q) => !seen.has(q.id));
  if (pool.length >= n) {
    return { questions: shuffle(pool, rng).slice(0, n), depleted: false };
  }
  const leftover = shuffle(pool, rng);
  seen = new Set();
  saveSeen(user, mode, seen);
  const fresh = shuffle(
    bank.filter((q) => !leftover.some((p) => p.id === q.id)),
    rng
  );
  return { questions: leftover.concat(fresh).slice(0, n), depleted: true };
}

// Pull N weighted across the five domains by EXAM_WEIGHTS, excluding seen.
export function pullWeighted(examBank, n, user, mode, sourceFilter, weights = EXAM_WEIGHTS, rng = Math.random) {
  const avail = DOMAINS.filter((d) => (examBank[d] || []).length > 0);
  if (avail.length === 0) return { questions: [], depleted: false };
  const totalW = avail.reduce((s, d) => s + (weights[d] || 0), 0);
  let picks = [];
  let depleted = false;
  avail.forEach((d) => {
    const want = Math.max(1, Math.round(n * ((weights[d] || 0) / totalW)));
    const res = pullFromDomain(examBank, d, want, user, mode, sourceFilter, rng);
    if (res.depleted) depleted = true;
    picks.push(...res.questions);
  });
  picks = shuffle(picks, rng);
  if (picks.length > n) picks = picks.slice(0, n);
  if (picks.length < n) {
    const seen = getSeen(user, mode);
    const extras = [];
    avail.forEach((d) => {
      filterBySource(examBank[d] || [], sourceFilter).forEach((q) => {
        if (!seen.has(q.id) && !picks.some((p) => p.id === q.id)) extras.push(q);
      });
    });
    picks = picks.concat(shuffle(extras, rng).slice(0, n - picks.length));
  }
  return { questions: picks, depleted };
}

// Shuffle options for presentation; answer index and rationales are permuted
// in lockstep so the feedback panel stays aligned to what's actually shown.
export function present(q, rng = Math.random) {
  const perm = shuffle([0, 1, 2, 3], rng);
  return {
    id: q.id,
    source: q.source,
    domain: q.domain,
    topic: q.topic,
    topicTitle: q.topicTitle,
    question: q.question,
    options: perm.map((i) => q.options[i]),
    rationales: perm.map((i) => q.rationales[i]),
    answer: perm.indexOf(q.answer),
  };
}

export function loadedDomains(examBank) {
  return DOMAINS.filter((d) => (examBank[d] || []).length > 0);
}
