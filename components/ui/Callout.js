import { Lightbulb, AlertTriangle, CheckCircle2, Info } from "lucide-react";

const TYPES = {
  key: { border: "border-l-info", bg: "bg-info-soft", label: "Key Point", labelColor: "text-info", Icon: Lightbulb },
  warn: { border: "border-l-bad", bg: "bg-bad-soft", label: "Watch Out", labelColor: "text-bad", Icon: AlertTriangle },
  tip: { border: "border-l-ok", bg: "bg-ok-soft", label: "Tip", labelColor: "text-ok", Icon: CheckCircle2 },
  info: { border: "border-l-info", bg: "bg-info-soft", label: "Info", labelColor: "text-info", Icon: Info },
};

export default function Callout({ kind = "tip", children }) {
  const t = TYPES[kind] || TYPES.tip;
  const Icon = t.Icon;
  return (
    <div className={`flex gap-3 rounded-lg border-l-4 ${t.border} ${t.bg} px-4 py-3.5 my-4 animate-fade-up`}>
      <Icon size={17} strokeWidth={2} className={`shrink-0 mt-0.5 ${t.labelColor}`} />
      <div>
        <div className={`text-[11px] font-bold uppercase tracking-wide mb-1 ${t.labelColor}`}>{t.label}</div>
        <div className="text-[14.5px] leading-relaxed text-ink-muted">{children}</div>
      </div>
    </div>
  );
}
