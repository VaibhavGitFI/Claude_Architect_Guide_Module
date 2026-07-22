import Btn from "@/components/ui/Btn";
import Bar from "@/components/ui/Bar";
import OptionsList from "@/components/quiz/OptionsList";
import { DOMAINS, DOMAIN_TITLES, DOMAIN_ACCENTS } from "@/lib/constants";

export default function ExamResults({ questions, answers, perDomain, passMark, pct, correct, total, onRestart, onBackToDashboard }) {
  const pass = passMark !== null && correct / total >= passMark;

  return (
    <div>
      <div
        className={`relative overflow-hidden rounded-xl p-9 mb-6 text-center text-white shadow-md animate-fade-up bg-gradient-to-br ${
          passMark === null ? "from-accent-700 via-accent to-accent-2" : pass ? "from-emerald-500 to-emerald-700" : "from-red-500 to-red-700"
        }`}
      >
        <div className="text-6xl font-extrabold leading-none animate-scale-in">{pct}%</div>
        <div className="text-[15px] opacity-95 mt-2">
          {correct} of {total} correct
        </div>
        {passMark !== null && (
          <div className="mt-3 inline-block px-4 py-1.5 rounded-full bg-white/20 font-semibold text-[14px]">
            {pass ? "✓ PASS" : "✗ FAIL"} — required {Math.round(passMark * 100)}%, scored {pct}%
          </div>
        )}
      </div>

      <h3 className="text-lg font-bold mb-3">Per-domain breakdown</h3>
      <div className="space-y-2 mb-7">
        {DOMAINS.filter((d) => perDomain[d].t > 0).map((d) => {
          const dpct = Math.round((perDomain[d].c / perDomain[d].t) * 100);
          return (
            <div key={d} className="grid grid-cols-[1fr_180px_100px] items-center gap-3.5 bg-surface border border-border-soft rounded-lg px-4 py-3">
              <div className="text-[13.5px] font-semibold">
                {d} {DOMAIN_TITLES[d]}
              </div>
              <Bar value={dpct} color={DOMAIN_ACCENTS[d]} h={7} />
              <div className="text-[13px] text-ink-dim text-right">
                {perDomain[d].c}/{perDomain[d].t} ({dpct}%)
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="text-lg font-bold mb-3">Question review</h3>
      <div className="space-y-5 mb-7">
        {questions.map((q, i) => {
          const chosen = answers[q.id];
          const ok = chosen === q.answer;
          return (
            <div key={q.id} className="bg-surface border border-border-soft rounded-xl p-5">
              <div className="text-[12.5px] text-ink-dim mb-2">
                {i + 1}. {q.domain} · {q.topic} {q.topicTitle} {ok ? "✓" : "✗"}
              </div>
              <div className="text-[15px] font-semibold mb-3">{q.question}</div>
              <OptionsList
                options={q.options}
                selected={chosen ?? null}
                correctIndex={q.answer}
                rationales={q.rationales}
                revealed
                disabled
              />
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Btn onClick={onRestart}>Back to setup</Btn>
        <Btn look="ghost" onClick={onBackToDashboard}>
          Back to dashboard
        </Btn>
      </div>
    </div>
  );
}
