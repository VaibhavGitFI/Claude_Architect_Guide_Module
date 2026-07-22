export default function TopicView({ topic }) {
  return (
    <div className="bg-surface border border-border-soft rounded-xl p-8 shadow-sm animate-fade-up">
      <div className="text-[11px] uppercase tracking-wide font-semibold text-ink-dim mb-1">{topic.id}</div>
      <h1 className="text-2xl font-bold mb-2">{topic.title}</h1>
      <p className="text-[15px] text-ink-dim mb-6">{topic.intro}</p>

      <h3 className="text-base font-semibold mb-2.5">Core Concepts</h3>
      <ul className="list-disc pl-5 space-y-1.5 mb-6">
        {topic.concepts.map((c, i) => (
          <li key={i} className="text-[14.5px] text-ink-muted">
            {c}
          </li>
        ))}
      </ul>

      <div className="rounded-lg border-l-4 border-l-bad bg-bad-soft px-4 py-3.5 mb-6">
        <h4 className="text-[13px] font-bold uppercase tracking-wide text-bad mb-1.5">
          Anti-Patterns to Avoid
        </h4>
        <ul className="list-disc pl-5 space-y-1">
          {topic.antiPatterns.map((a, i) => (
            <li key={i} className="text-[13.5px] text-ink-muted">
              {a}
            </li>
          ))}
        </ul>
      </div>

      <h3 className="text-base font-semibold mb-2.5">Deep Dive</h3>
      <div className="space-y-3 mb-6">
        {topic.deepDive.map((p, i) => (
          <p key={i} className="text-[14.5px] leading-relaxed text-ink-muted">
            {p}
          </p>
        ))}
      </div>

      <h3 className="text-base font-semibold mb-2.5">Code Example — {topic.code.title}</h3>
      <pre className="bg-[#0f172a] text-[#e2e8f0] rounded-lg p-4 overflow-x-auto text-[13px] leading-relaxed font-mono mb-6">
        <code>{topic.code.body}</code>
      </pre>

      {topic.compare && (
        <>
          <h3 className="text-base font-semibold mb-2.5">Compare: Anti-Pattern vs Correct Approach</h3>
          <div className="grid md:grid-cols-2 gap-3.5 mb-6">
            <div className="rounded-lg p-4 bg-bad-soft border border-red-200">
              <h4 className="text-[12.5px] font-bold uppercase tracking-wide text-bad mb-2">
                ✗ Anti-Pattern
              </h4>
              <pre className="bg-[#0f172a] text-[#e2e8f0] rounded-md p-3 overflow-x-auto text-[12.5px] font-mono">
                <code>{topic.compare.bad}</code>
              </pre>
            </div>
            <div className="rounded-lg p-4 bg-ok-soft border border-emerald-200">
              <h4 className="text-[12.5px] font-bold uppercase tracking-wide text-ok mb-2">✓ Correct</h4>
              <pre className="bg-[#0f172a] text-[#e2e8f0] rounded-md p-3 overflow-x-auto text-[12.5px] font-mono">
                <code>{topic.compare.good}</code>
              </pre>
            </div>
          </div>
        </>
      )}

      <div className="rounded-lg border-l-4 border-l-warn bg-warn-soft px-4 py-3.5">
        <strong className="text-amber-800">🎯 Exam Tip:</strong>{" "}
        <span className="text-[14px] text-ink-muted">{topic.examTip}</span>
      </div>
    </div>
  );
}
