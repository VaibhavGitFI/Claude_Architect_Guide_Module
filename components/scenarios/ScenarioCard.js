export default function ScenarioCard({ scenario, index }) {
  return (
    <div
      className="bg-surface border border-border-soft rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <h2 className="text-xl font-semibold mb-1.5">
        <span className="text-accent font-bold mr-2">Scenario {scenario.id}</span>
        {scenario.title}
      </h2>
      <p className="text-[14.5px] text-ink-dim mb-3">{scenario.summary}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {scenario.focus.map((f, i) => (
          <span key={i} className="bg-accent-soft text-accent-700 px-2.5 py-1 rounded-full text-[11.5px] font-semibold">
            {f}
          </span>
        ))}
      </div>

      <h3 className="text-[15px] font-semibold mb-2.5">Key Architectural Decisions</h3>
      <div className="space-y-2.5 mb-4">
        {scenario.decisions.map((d, i) => (
          <div key={i} className="bg-background border border-border-soft rounded-lg p-3.5">
            <div className="font-semibold text-[13.5px] mb-1.5">{d.q}</div>
            <div className="grid grid-cols-[90px_1fr] gap-2 text-[13.5px] mb-1">
              <span className="font-semibold text-ok">✓ Correct</span>
              <span className="text-ink-muted">{d.correct}</span>
            </div>
            <div className="grid grid-cols-[90px_1fr] gap-2 text-[13.5px]">
              <span className="font-semibold text-bad">✗ Anti-Pattern</span>
              <span className="text-ink-muted">{d.anti}</span>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-[15px] font-semibold mb-2">Domains Tested</h3>
      <ul className="list-disc pl-5 space-y-1 mb-4">
        {scenario.domainsTested.map((d, i) => (
          <li key={i} className="text-[13.5px] text-ink-muted">
            {d}
          </li>
        ))}
      </ul>

      <div className="rounded-lg p-3.5 bg-gradient-to-br from-accent-soft to-blue-50">
        <strong className="text-accent-700">Exam Strategy:</strong>{" "}
        <span className="text-[13.5px] text-ink-muted">{scenario.strategy}</span>
      </div>
    </div>
  );
}
