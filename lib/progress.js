/*
 * Port of v1/app.js's progress storage: getProgress/saveProgress/logAttempt/
 * logMockResult. Same localStorage key scheme and shapes, parameterized by
 * `user` instead of reading a DOM input.
 */
import { STORAGE_PREFIX } from "./constants";

function key(user, name) {
  return `${STORAGE_PREFIX}${user}::${name}`;
}

const EMPTY_PROGRESS = { attempts: {}, mockHistory: [], flashStats: {} };

export function getProgress(user) {
  if (typeof window === "undefined") return { ...EMPTY_PROGRESS };
  try {
    const raw = localStorage.getItem(key(user, "progress"));
    return raw ? JSON.parse(raw) : { ...EMPTY_PROGRESS };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

export function saveProgress(user, p) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key(user, "progress"), JSON.stringify(p));
}

export function logAttempt(user, qid, domain, topic, correct, mode) {
  const p = getProgress(user);
  if (!p.attempts) p.attempts = {};
  p.attempts[qid] = { correct: !!correct, domain, topic, mode, ts: Date.now() };
  saveProgress(user, p);
}

export function logMockResult(user, mode, score, total, perDomain, passMark, durationSec) {
  const p = getProgress(user);
  if (!p.mockHistory) p.mockHistory = [];
  p.mockHistory.unshift({
    mode,
    score,
    total,
    pct: total ? Math.round((score / total) * 100) : 0,
    perDomain: perDomain || {},
    passMark,
    durationSec: durationSec || 0,
    ts: Date.now(),
  });
  if (p.mockHistory.length > 20) p.mockHistory = p.mockHistory.slice(0, 20);
  saveProgress(user, p);
}

export function setFlashStat(user, cardId, stat) {
  const p = getProgress(user);
  if (!p.flashStats) p.flashStats = {};
  p.flashStats[cardId] = stat;
  saveProgress(user, p);
}

export function resetAllProgress(user) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key(user, "progress"));
  const prefix = key(user, "exam::seen::");
  Object.keys(localStorage).forEach((k) => {
    if (k.indexOf(prefix) === 0) localStorage.removeItem(k);
  });
}
