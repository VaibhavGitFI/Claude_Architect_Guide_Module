const SEVERITY_STYLES = {
  critical: "bg-bad-soft text-bad",
  high: "bg-warn-soft text-warn",
  medium: "bg-accent-soft text-accent-700",
};

export default function AntiPatternCard({ ap, index }) {
  return (
    <div
      className="bg-surface border border-border-soft rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
    >
      <div className="flex items-center gap-2.5 flex-wrap mb-2">
        <div className="font-semibold text-[15px] flex-1">✗ {ap.title}</div>
        <span
          className={`text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${SEVERITY_STYLES[ap.severity]}`}
        >
          {ap.severity}
        </span>
        <span className="text-[11px] text-ink-dim bg-accent-soft px-2.5 py-0.5 rounded-full font-semibold">
          {ap.domain}
        </span>
      </div>
      <p className="text-[13.5px] text-ink-dim mb-3">
        <strong className="text-ink-muted">Why it&apos;s wrong:</strong> {ap.why}
      </p>
      <div className="rounded-lg border-l-[3px] border-l-ok bg-ok-soft px-3.5 py-2.5">
        <p className="text-[13px] mb-1">
          <strong className="text-ok">✓ Correct:</strong> {ap.fix}
        </p>
        <p className="text-[12.5px] text-emerald-700">{ap.fixWhy}</p>
      </div>
    </div>
  );
}
