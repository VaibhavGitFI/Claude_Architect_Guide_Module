/*
 * Port of the dashboard readiness/next-action logic from v1/app.js's
 * renderDashboard(). Same formula, same verdict thresholds, same
 * next-action priority chain — ported verbatim, not redesigned.
 */
import { DOMAINS, EXAM_WEIGHTS, REAL_EXAM_PASS_MARK, DOMAIN_TITLES } from "./constants";

// readiness_d = accuracy_d * min(coverage_d / 0.30, 1)  (cap at 30% coverage)
// `poolSizes` is a plain {D1: 49, D2: 50, ...} map (see lib/data/summary.json)
// — the dashboard only needs counts, not full question content.
export function computePerDomainStats(poolSizes, attempts) {
  const perD = {};
  DOMAINS.forEach((d) => {
    const poolSize = poolSizes[d] || 0;
    const domainAttempts = Object.entries(attempts).filter(([, a]) => a.domain === d);
    const attemptedIds = new Set(domainAttempts.map(([id]) => id));
    const correctCount = domainAttempts.filter(([, a]) => a.correct).length;
    const totalCount = domainAttempts.length;
    const accuracy = totalCount ? correctCount / totalCount : 0;
    const coverage = poolSize ? attemptedIds.size / poolSize : 0;
    perD[d] = { poolSize, attempted: attemptedIds.size, attemptsCount: totalCount, correctCount, accuracy, coverage };
  });
  return perD;
}

export function computeReadiness(perD) {
  let num = 0;
  let den = 0;
  DOMAINS.forEach((d) => {
    const w = EXAM_WEIGHTS[d];
    const covWeight = Math.min(perD[d].coverage / 0.3, 1);
    num += w * perD[d].accuracy * covWeight;
    den += w;
  });
  return Math.round((den ? num / den : 0) * 100);
}

export function readinessVerdict(totalAttemptsCount, readinessPct) {
  if (totalAttemptsCount === 0) return { verdict: "Not started — pick a domain to begin", tier: "none" };
  if (readinessPct < 30) return { verdict: "Building foundations", tier: "low" };
  if (readinessPct < 60) return { verdict: "On track — keep practising", tier: "mid" };
  if (readinessPct < 80) return { verdict: "Strong — time for a Mock Exam", tier: "good" };
  return { verdict: "Exam-ready (≥80%)", tier: "ready" };
}

// Priority chain: no attempts -> D1; else worst domain by accuracy*coverage-weight
// (unattempted -> drill it; <70% accuracy -> drill it; else no mock history ->
// suggest Mock; best mock <72% -> retake Mock; else -> Real Exam Simulation.
export function nextAction(totalAttemptsCount, perD, mockHistory) {
  const bestMock = mockHistory.length ? Math.max(...mockHistory.map((h) => h.pct)) : null;

  if (totalAttemptsCount === 0) {
    return {
      title: "Start with Domain 1 — the largest slice of the exam (27%).",
      body: "D1 covers agentic loops, hub-and-spoke orchestration, hooks and session management. Get comfortable here before branching out.",
      cta: "quiz",
      ctaLabel: "Start Domain Quiz →",
    };
  }

  let worst = null;
  let worstScore = Infinity;
  DOMAINS.forEach((d) => {
    const s = perD[d];
    const covW = Math.min(s.coverage / 0.3, 1);
    const compositeScore = s.attempted === 0 ? -1 : s.accuracy * covW;
    if (compositeScore < worstScore) {
      worstScore = compositeScore;
      worst = d;
    }
  });
  const ws = perD[worst];

  if (ws.attempted === 0) {
    return {
      title: `Open up ${worst} next — you haven't practised it yet.`,
      body: `${DOMAIN_TITLES[worst]} is ${Math.round(EXAM_WEIGHTS[worst] * 100)}% of the exam. Even a short drill builds coverage.`,
      cta: "quiz",
      ctaLabel: `Drill ${worst} →`,
    };
  }
  if (ws.accuracy < 0.7) {
    return {
      title: `${worst} is your weakest domain — accuracy ${Math.round(ws.accuracy * 100)}%.`,
      body: `Drill ${DOMAIN_TITLES[worst]} until you're consistently above 70%, then come back for a Mock Exam.`,
      cta: "quiz",
      ctaLabel: `Drill ${worst} →`,
    };
  }
  if (mockHistory.length === 0) {
    return {
      title: "You're solid on per-domain drills — time for your first Mock Exam.",
      body: "A weighted mock with a timer will surface gaps drilling alone won't show.",
      cta: "mock",
      ctaLabel: "Start Mock Exam →",
    };
  }
  if (bestMock !== null && bestMock < Math.round(REAL_EXAM_PASS_MARK * 100)) {
    return {
      title: `Best mock so far: ${bestMock}%. Pass mark is ${Math.round(REAL_EXAM_PASS_MARK * 100)}%.`,
      body: "Review the weakest domains from your last mock, then retake.",
      cta: "mock",
      ctaLabel: "Retake Mock Exam →",
    };
  }
  return {
    title: "You're passing Mocks — try a full Real Exam under exam conditions.",
    body: "Real Exam uses real weighting and a 72% pass mark. No source filters, results-only at the end.",
    cta: "real-exam",
    ctaLabel: "Start Real Exam Simulation →",
  };
}
