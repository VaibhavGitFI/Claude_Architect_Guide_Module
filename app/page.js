"use client";

import { useMemo } from "react";
import summary from "@/lib/data/summary.json";
import { useUser } from "@/lib/useUser";
import { getProgress } from "@/lib/progress";
import { computePerDomainStats, computeReadiness, readinessVerdict, nextAction } from "@/lib/readiness";
import StatGrid from "@/components/dashboard/StatGrid";
import ReadinessCard from "@/components/dashboard/ReadinessCard";
import NextActionCard from "@/components/dashboard/NextActionCard";
import DomainMasteryGrid from "@/components/dashboard/DomainMasteryGrid";
import RecentActivity from "@/components/dashboard/RecentActivity";
import WeightsTable from "@/components/dashboard/WeightsTable";

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-72 bg-border-soft rounded" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-border-soft rounded-xl" />
        ))}
      </div>
      <div className="h-40 bg-border-soft rounded-xl" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-52 bg-border-soft rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, ready } = useUser();

  // Derived purely from (ready, user) — a memo, not effect+setState, since
  // this page is freshly mounted on each navigation to "/" anyway.
  const data = useMemo(() => {
    if (!ready) return null;
    const p = getProgress(user);
    const attempts = p.attempts || {};
    const history = p.mockHistory || [];

    const perD = computePerDomainStats(summary.examBankCounts, attempts);
    const totalAttemptsCount = Object.keys(attempts).length;
    const correctCount = Object.values(attempts).filter((a) => a.correct).length;
    const overallAccuracy = totalAttemptsCount ? Math.round((correctCount / totalAttemptsCount) * 100) : 0;
    const bestMock = history.length ? Math.max(...history.map((h) => h.pct)) : null;
    const readinessPct = computeReadiness(perD);
    const { verdict, tier } = readinessVerdict(totalAttemptsCount, readinessPct);
    const action = nextAction(totalAttemptsCount, perD, history);

    return { perD, totalAttemptsCount, overallAccuracy, bestMock, readinessPct, verdict, tier, action, history };
  }, [ready, user]);

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl mb-6 p-8 text-white bg-gradient-to-br from-accent-700 via-accent to-accent-2 shadow-md animate-fade-up">
        <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-white/15 pointer-events-none" />
        <h1 className="relative text-3xl font-bold mb-2">Claude Certified Architect — Exam Prep</h1>
        <p className="relative text-[15px] opacity-95 max-w-3xl">
          Five domains. 279 scenario-based practice questions with per-option rationales, timed Mock and
          Real Exam Simulation modes with no-repeat selection, and a study guide drawn from the public
          reference content. Your practice is tracked here.
        </p>
      </div>

      {!data ? (
        <DashboardSkeleton />
      ) : (
        <>
          <StatGrid
            totalQuestions={summary.totalQuestions}
            attempted={data.totalAttemptsCount}
            accuracy={data.overallAccuracy}
            bestMock={data.bestMock}
          />
          <ReadinessCard readinessPct={data.readinessPct} verdict={data.verdict} tier={data.tier} />
          <NextActionCard action={data.action} />

          <h2 className="text-xl font-bold mb-3">Domain mastery</h2>
          <DomainMasteryGrid perD={data.perD} />

          <h2 className="text-xl font-bold mb-3">Recent exam attempts</h2>
          <RecentActivity history={data.history} />
        </>
      )}

      <h2 className="text-xl font-bold mb-3">Recommended study path</h2>
      <ol className="list-decimal pl-5 space-y-2 mb-7 text-[14.5px] text-ink-muted">
        <li>
          <strong className="text-ink">Read</strong> each Domain in the Study Guide — focus on the red
          Anti-Pattern callouts.
        </li>
        <li>
          <strong className="text-ink">Drill</strong> each domain in the Domain Quiz — instant per-option
          rationales reinforce the trap patterns.
        </li>
        <li>
          <strong className="text-ink">Walk through</strong> the Scenarios — 4 of these appear on the
          real exam.
        </li>
        <li>
          <strong className="text-ink">Sit</strong> a Mock Exam under time. Once consistently above 80%,
          take the Real Exam Simulation (72% pass mark).
        </li>
      </ol>

      <h2 className="text-xl font-bold mb-3">Domain weighting</h2>
      <WeightsTable />
    </div>
  );
}
