const TONES = {
  neutral: "text-ink-dim bg-surface border-border",
  accent: "text-accent-700 bg-accent-soft border-accent",
  ok: "text-ok bg-ok-soft border-ok/40",
  bad: "text-bad bg-bad-soft border-bad/40",
  warn: "text-warn bg-warn-soft border-warn/40",
  info: "text-info bg-info-soft border-info/40",
};

export default function Chip({ children, tone = "neutral", active, onClick, className = "" }) {
  const clickable = typeof onClick === "function";
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11.5px] font-semibold uppercase tracking-wide transition-all ${
        active ? "bg-accent text-white border-transparent shadow-sm" : TONES[tone]
      } ${clickable ? "cursor-pointer hover:-translate-y-px active:translate-y-0" : ""} ${className}`}
    >
      {children}
    </span>
  );
}
