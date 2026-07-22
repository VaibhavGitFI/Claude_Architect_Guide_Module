"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@/lib/useUser";
import { logAttempt, logMockResult } from "@/lib/progress";
import { pullWeighted, present, markSeen, resetSeen, loadedDomains } from "@/lib/examEngine";
import { EXAM_BANK } from "@/lib/examBank";
import { EXAM_WEIGHTS } from "@/lib/constants";
import ExamIntroForm from "@/components/exam/ExamIntroForm";
import ExamResults from "@/components/exam/ExamResults";
import OptionsList from "@/components/quiz/OptionsList";
import Btn from "@/components/ui/Btn";
import Card from "@/components/ui/Card";

export default function TimedExamRunner({ mode, title, lead, defaults, countOptions, timeOptions, showSourceFilter, passMark, onBackToDashboard }) {
  const { user, ready } = useUser();
  const [phase, setPhase] = useState("intro");

  const [count, setCount] = useState(defaults.count);
  const [time, setTime] = useState(defaults.time);
  const [source, setSource] = useState(defaults.source);

  const [session, setSession] = useState(null); // { raw, questions, idx, answers, timeLimit, timeLeft, startTs }
  const timerRef = useRef(null);
  // Always-current mirror of `session`, so callbacks that must read the
  // latest state (finish, requestFinish) don't need `session` in their own
  // deps and don't need to run side effects inside a setState updater —
  // React (StrictMode in particular) may invoke updater functions more than
  // once, which would double-log progress if logging lived in there.
  const sessionRef = useRef(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);
  const finishedRef = useRef(false);

  const loaded = ready ? loadedDomains(EXAM_BANK) : [];
  const totalAvailable = loaded.reduce((s, d) => s + (EXAM_BANK[d] || []).length, 0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Plain callback — reads the latest session via ref, performs its side
  // effects (localStorage writes) directly, then a single non-side-effecting
  // setState. Guarded by finishedRef so it's safe to call more than once.
  const finish = useCallback(() => {
    clearTimer();
    if (finishedRef.current) return;
    const s = sessionRef.current;
    if (!s) return;
    finishedRef.current = true;

    markSeen(
      user,
      s.raw.map((q) => q.id),
      `timed:${mode}`
    );
    let correct = 0;
    const perDomain = { D1: { c: 0, t: 0 }, D2: { c: 0, t: 0 }, D3: { c: 0, t: 0 }, D4: { c: 0, t: 0 }, D5: { c: 0, t: 0 } };
    s.questions.forEach((q, i) => {
      perDomain[q.domain].t++;
      const isCorrect = s.answers[q.id] === q.answer;
      if (isCorrect) {
        correct++;
        perDomain[q.domain].c++;
      }
      const rawQ = s.raw[i];
      if (rawQ) logAttempt(user, rawQ.id, rawQ.domain, rawQ.topic, isCorrect, mode);
    });
    const total = s.questions.length;
    const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
    const durationSec = Math.round((Date.now() - s.startTs) / 1000);
    logMockResult(user, mode, correct, total, perDomain, passMark, durationSec);

    setSession({ ...s, finished: { correct, total, pct, perDomain } });
    setPhase("results");
  }, [clearTimer, mode, passMark, user]);

  // Pure countdown (safe under double-invoke — just arithmetic); the
  // transition-to-zero side effect lives in the effect below instead of
  // inside this updater.
  useEffect(() => {
    if (phase !== "running" || !session || session.timeLimit <= 0) return;
    timerRef.current = setInterval(() => {
      setSession((s) => (s ? { ...s, timeLeft: Math.max(0, s.timeLeft - 1) } : s));
    }, 1000);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, session?.timeLimit]);

  useEffect(() => {
    if (phase === "running" && session && session.timeLimit > 0 && session.timeLeft <= 0) {
      finish();
    }
  }, [phase, session, finish]);

  const start = useCallback(() => {
    const res = pullWeighted(EXAM_BANK, count, user, `timed:${mode}`, showSourceFilter ? source : "all", EXAM_WEIGHTS);
    if (!res.questions.length) {
      alert("No questions available. Load at least one domain bank first.");
      return;
    }
    finishedRef.current = false;
    const presented = res.questions.map((q) => present(q));
    setSession({
      raw: res.questions,
      questions: presented,
      idx: 0,
      answers: {},
      timeLimit: time,
      timeLeft: time * 60,
      startTs: Date.now(),
      depleted: res.depleted,
      finished: null,
    });
    setPhase("running");
  }, [count, mode, showSourceFilter, source, time, user]);

  const selectAnswer = useCallback((i) => {
    setSession((s) => {
      if (!s) return s;
      const q = s.questions[s.idx];
      return { ...s, answers: { ...s.answers, [q.id]: i } };
    });
  }, []);

  const goto = useCallback((delta) => {
    setSession((s) => {
      if (!s) return s;
      const idx = Math.max(0, Math.min(s.questions.length - 1, s.idx + delta));
      return { ...s, idx };
    });
  }, []);

  const requestFinish = useCallback(() => {
    const s = sessionRef.current;
    if (!s) return;
    const unanswered = s.questions.length - Object.keys(s.answers).length;
    if (unanswered > 0 && !confirm(`${unanswered} question(s) unanswered. Finish anyway?`)) return;
    finish();
  }, [finish]);

  const abort = useCallback(() => {
    if (!confirm("Abort the exam? Your progress will be lost and no questions will be marked seen.")) return;
    clearTimer();
    finishedRef.current = false;
    setSession(null);
    setPhase("intro");
  }, [clearTimer]);

  // Keyboard shortcuts scoped to this page: 1-4 select, ←/→ navigate, Enter = next.
  useEffect(() => {
    function handler(e) {
      const tag = e.target?.tagName || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (phase !== "running" || !session) return;
      if (/^[1-4]$/.test(e.key)) {
        e.preventDefault();
        selectAnswer(parseInt(e.key, 10) - 1);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goto(-1);
        return;
      }
      if (e.key === "ArrowRight" || e.key === "Enter") {
        if (session.idx < session.questions.length - 1) {
          e.preventDefault();
          goto(1);
        }
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [phase, session, selectAnswer, goto]);

  if (!ready) return <div className="animate-pulse h-96 bg-border-soft rounded-xl" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-ink-dim text-[15px] max-w-3xl mb-5">{lead}</p>

      {phase === "intro" && (
        <ExamIntroForm
          loadedCount={loaded.length}
          totalAvailable={totalAvailable}
          mode={mode}
          count={count}
          setCount={setCount}
          countOptions={countOptions}
          time={time}
          setTime={setTime}
          timeOptions={timeOptions}
          showSourceFilter={showSourceFilter}
          source={source}
          setSource={setSource}
          onStart={start}
          onResetSeen={() => resetSeen(user, `timed:${mode}`)}
        />
      )}

      {phase === "running" && session && (
        <RunningExam session={session} onSelect={selectAnswer} onPrev={() => goto(-1)} onNext={() => goto(1)} onFinish={requestFinish} onAbort={abort} />
      )}

      {phase === "results" && session?.finished && (
        <ExamResults
          questions={session.questions}
          answers={session.answers}
          perDomain={session.finished.perDomain}
          passMark={passMark}
          pct={session.finished.pct}
          correct={session.finished.correct}
          total={session.finished.total}
          onRestart={() => {
            setSession(null);
            setPhase("intro");
          }}
          onBackToDashboard={onBackToDashboard}
        />
      )}
    </div>
  );
}

function RunningExam({ session, onSelect, onPrev, onNext, onFinish, onAbort }) {
  const q = session.questions[session.idx];
  const sel = session.answers[q.id];
  const isLast = session.idx === session.questions.length - 1;
  const m = Math.floor(session.timeLeft / 60);
  const sec = session.timeLeft % 60;
  const danger = session.timeLimit > 0 && session.timeLeft < 60;
  const warn = session.timeLimit > 0 && session.timeLeft < 300 && session.timeLeft >= 60;

  return (
    <div>
      <div
        className={`sticky top-0 z-10 flex justify-between items-center rounded-lg px-4 py-3 mb-4 font-semibold text-white shadow-sm ${
          session.timeLimit <= 0 ? "bg-ok" : danger ? "bg-bad animate-pulse" : warn ? "bg-warn" : "bg-accent"
        }`}
      >
        <span>{session.timeLimit <= 0 ? "No time limit" : `Time remaining: ${m}:${sec.toString().padStart(2, "0")}`}</span>
        <span>
          Q {session.idx + 1} / {session.questions.length}
        </span>
      </div>

      {session.depleted && (
        <div className="rounded-lg bg-info-soft text-info px-4 py-3 mb-4 text-[13.5px]">
          Seen pool exhausted — it was auto-reset for this run.
        </div>
      )}

      <Card className="p-7">
        <div className="text-[13px] text-ink-dim mb-4 pb-3 border-b border-border-soft">
          {q.domain} · {q.topic} {q.topicTitle}
        </div>
        <div className="text-[16px] font-semibold mb-4 leading-relaxed">{q.question}</div>
        <OptionsList options={q.options} selected={sel} correctIndex={null} revealed={false} onSelect={onSelect} disabled={false} />

        <div className="flex justify-between items-center mt-6">
          <Btn look="ghost" onClick={onPrev} disabled={session.idx === 0}>
            ← Previous
          </Btn>
          <div className="flex gap-2.5">
            {isLast ? (
              <Btn onClick={onFinish}>Finish exam</Btn>
            ) : (
              <Btn onClick={onNext}>Next →</Btn>
            )}
            <Btn look="ghost" onClick={onAbort}>
              Abort
            </Btn>
          </div>
        </div>
      </Card>
    </div>
  );
}
