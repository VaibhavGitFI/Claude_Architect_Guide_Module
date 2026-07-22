import Callout from "@/components/ui/Callout";

export default function StudyOverview({ sc }) {
  return (
    <div className="bg-surface border border-border-soft rounded-xl p-8 shadow-sm animate-fade-up">
      <div className="text-[11px] uppercase tracking-wide font-semibold text-ink-dim mb-1">{sc.weight}</div>
      <h1 className="text-2xl font-bold mb-2">{sc.title}</h1>
      <p className="text-[15px] text-ink-dim mb-6">{sc.summary}</p>

      <h3 className="text-base font-semibold mb-2.5">Topics in this Domain</h3>
      <ul className="list-disc pl-5 space-y-1.5 mb-6">
        {sc.topics.map((t) => (
          <li key={t.id} className="text-[14.5px] text-ink-muted">
            <strong className="text-ink">{t.id}</strong> — {t.title}
          </li>
        ))}
      </ul>

      <h3 className="text-base font-semibold mb-2.5">Exam Tips for this Domain</h3>
      {/* Source data authors <strong> tags directly in these strings (v1 rendered
          them unescaped too) — trusted, static, our own content, not user input. */}
      <ol className="list-decimal pl-5 space-y-1.5 mb-6">
        {sc.examTips.map((tip, i) => (
          <li key={i} className="text-[14.5px] text-ink-muted [&_strong]:text-ink" dangerouslySetInnerHTML={{ __html: tip }} />
        ))}
      </ol>

      <Callout kind="info">
        Use the sidebar to drill into each topic. Each topic includes concepts, anti-patterns, a deep
        dive, code, comparisons, and an exam tip.
      </Callout>
    </div>
  );
}
