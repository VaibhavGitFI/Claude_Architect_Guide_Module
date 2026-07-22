"use client";

import { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/lib/useUser";
import { getProgress, logAttempt } from "@/lib/progress";
import { poolStatus, pullFromDomain, present, markSeen, resetSeen } from "@/lib/examEngine";
import { DOMAINS } from "@/lib/constants";
import DomainPicker from "@/components/quiz/DomainPicker";
import OptionsList from "@/components/quiz/OptionsList";
import Btn from "@/components/ui/Btn";
import Card from "@/components/ui/Card";
import { Sparkles } from "lucide-react";
import { EXAM_BANK } from "@/lib/examBank";

function QuizPageInner() {
  const { user, ready } = useUser();
  const searchParams = useSearchParams();

  const [phase, setPhase] = useState("picker");
  const [domain, setDomain] = useState(null);
  const [source, setSource] = useState("all");
  const [current, setCurrent] = useState(null); // { raw, presented, depleted, answered }
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [poolTick, setPoolTick] = useState(0); // bump to force pool-status recompute
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const poolStatuses = useMemo(() => {
    if (!ready) return null;
    const out = {};
    DOMAINS.forEach((d) => {
      out[d] = poolStatus(EXAM_BANK, d, user, `drill:${d}`, source);
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user, source, poolTick]);

  // Takes an explicit domain rather than reading `domain` state, since state
  // set a moment earlier (e.g. in startDrill) isn't visible yet within the
  // same event handler — avoids needing a reactive effect to "catch up".
  const pullNext = useCallback(
    (d) => {
      const mode = `drill:${d}`;
      const res = pullFromDomain(EXAM_BANK, d, 1, user, mode, source);
      if (!res.questions.length) {
        setCurrent(null);
        return;
      }
      setCurrent({
        raw: res.questions[0],
        presented: present(res.questions[0]),
        depleted: res.depleted,
        answered: null,
      });
      setAiError(null);
    },
    [user, source]
  );

  const nextQuestion = useCallback(() => {
    if (domain) pullNext(domain);
  }, [domain, pullNext]);

  const startDrill = useCallback(
    (d) => {
      setDomain(d);
      setScore({ correct: 0, total: 0 });
      setPhase("question");
      pullNext(d);
    },
    [pullNext]
  );

  // Auto-start from the Dashboard's "Practise D{n}" link (?domain=D1&autostart=1).
  // This intentionally calls an imperative multi-state action (startDrill,
  // which also pulls from the seen-pool) in response to a URL change — that's
  // "synchronizing with an external system" (the URL), the case the
  // set-state-in-effect rule itself carves out, not a derivable value.
  useEffect(() => {
    if (!ready) return;
    const qDomain = (searchParams.get("domain") || "").toUpperCase();
    const autostart = searchParams.get("autostart");
    if (autostart && DOMAINS.includes(qDomain) && phase === "picker") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      startDrill(qDomain);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, searchParams]);

  const answer = useCallback(
    (idx) => {
      if (!current || current.answered !== null) return;
      const correct = idx === current.presented.answer;
      setCurrent((c) => ({ ...c, answered: idx }));
      setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
      markSeen(user, [current.raw.id], `drill:${domain}`);
      logAttempt(user, current.raw.id, current.raw.domain, current.raw.topic, correct, "drill");
      setPoolTick((t) => t + 1);
    },
    [current, user, domain]
  );

  const requestAiVariant = useCallback(async () => {
    if (!current) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const pool = EXAM_BANK[domain] || [];
      const sameTopic = pool.filter((q) => q.topic === current.raw.topic);
      const styleRef = (sameTopic.length ? sameTopic : pool).slice(0, 2).map((q) => ({
        question: q.question,
        options: q.options,
        answer: q.answer,
        rationales: q.rationales,
      }));
      const resp = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          topic: current.raw.topic,
          topicTitle: current.raw.topicTitle,
          styleRef,
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }
      const raw = await resp.json();
      setCurrent({ raw, presented: present(raw), depleted: false, answered: null });
    } catch (err) {
      setAiError(err.message || "Couldn't reach the AI generator");
      setTimeout(nextQuestion, 900);
    } finally {
      setAiLoading(false);
    }
  }, [current, domain, nextQuestion]);

  // Keyboard shortcuts scoped to this page: 1-4 select, N/Enter/Space advance.
  useEffect(() => {
    function handler(e) {
      const tag = e.target?.tagName || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (phase !== "question" || !current) return;
      if (/^[1-4]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (current.answered === null) {
          e.preventDefault();
          answer(idx);
        }
        return;
      }
      if (current.answered !== null && (e.key === "n" || e.key === "N" || e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        nextQuestion();
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [phase, current, answer, nextQuestion]);

  if (!ready || !poolStatuses) {
    return <div className="animate-pulse h-96 bg-border-soft rounded-xl" />;
  }

  if (phase === "picker") {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">Domain Quiz</h1>
        <p className="text-ink-dim text-[15px] max-w-3xl mb-5">
          Drill scenario-based exam-sim questions one domain at a time. Instant feedback per question
          with the rationale for every option. Questions don&apos;t repeat within your seen pool and
          options are shuffled every attempt.
        </p>
        <div className="inline-flex items-center gap-2.5 bg-surface border border-border-soft rounded-full px-4 py-2.5 mb-5 shadow-sm">
          <label className="text-[13.5px] text-ink-muted">Source filter:</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="border border-border rounded-md px-2.5 py-1 text-[13px] bg-surface"
          >
            <option value="all">All (sim + authored extras)</option>
            <option value="sim">Sim only (verbatim Exam-Sim)</option>
            <option value="extra">Extras only (authored)</option>
          </select>
        </div>
        <DomainPicker
          poolStatuses={poolStatuses}
          onStart={startDrill}
          onResetSeen={(d) => {
            resetSeen(user, `drill:${d}`);
            setPoolTick((t) => t + 1);
          }}
        />
      </div>
    );
  }

  // phase === "question"
  if (!current) {
    return (
      <Card className="p-8 text-center text-ink-dim">
        No questions available for that source filter.
        <div className="mt-4">
          <Btn onClick={() => setPhase("picker")}>Back to domain picker</Btn>
        </div>
      </Card>
    );
  }

  const q = current.presented;
  const status = poolStatuses[domain];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Domain Quiz</h1>
      {current.depleted && (
        <div className="rounded-lg bg-info-soft text-info px-4 py-3 mb-4 text-[13.5px]">
          Seen pool exhausted — it was auto-reset. Questions may repeat from earlier in this session.
        </div>
      )}
      <Card className="p-7">
        <div className="flex justify-between items-center text-[13px] text-ink-dim mb-4 pb-3 border-b border-border-soft">
          <span>
            {domain} · {q.topic} {q.topicTitle}{" "}
            <span
              className={`ml-1.5 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                q.source === "sim" ? "bg-ok-soft text-ok" : q.source === "ai" ? "bg-accent-soft text-accent-700" : "bg-accent-soft text-accent-700"
              }`}
            >
              {q.source === "sim" ? "verbatim sim" : q.source === "ai" ? "AI variant" : "authored"}
            </span>
          </span>
          <span>
            Pool: {status.remaining}/{status.total} · Score {score.correct}/{score.total}
          </span>
        </div>

        <div className="text-[16px] font-semibold mb-4 leading-relaxed">{q.question}</div>
        <OptionsList
          options={q.options}
          selected={current.answered}
          correctIndex={current.answered !== null ? q.answer : null}
          rationales={current.answered !== null ? q.rationales : null}
          revealed={current.answered !== null}
          onSelect={answer}
          disabled={current.answered !== null}
        />

        {current.answered !== null && (
          <div
            className={`mt-4 rounded-lg px-4 py-3 font-semibold text-[14.5px] animate-fade-up ${
              current.answered === q.answer ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad"
            }`}
          >
            {current.answered === q.answer
              ? "✓ Correct"
              : `✗ Incorrect — correct answer: ${String.fromCharCode(65 + q.answer)}`}
          </div>
        )}

        {aiError && <div className="mt-3 rounded-lg bg-warn-soft text-warn px-4 py-2.5 text-[13px]">{aiError}</div>}

        {current.answered !== null && (
          <div className="flex gap-2.5 flex-wrap mt-5">
            <Btn onClick={nextQuestion}>Next question →</Btn>
            <Btn look="outline" Icon={Sparkles} onClick={requestAiVariant} disabled={aiLoading}>
              {aiLoading ? "Generating…" : "AI variant →"}
            </Btn>
            <Btn look="ghost" onClick={() => setPhase("picker")}>
              Back to domain picker
            </Btn>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-96 bg-border-soft rounded-xl" />}>
      <QuizPageInner />
    </Suspense>
  );
}
