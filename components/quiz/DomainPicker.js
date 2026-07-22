import { DOMAINS, DOMAIN_TITLES, DOMAIN_ACCENTS } from "@/lib/constants";
import Btn from "@/components/ui/Btn";

export default function DomainPicker({ poolStatuses, onStart, onResetSeen }) {
  return (
    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {DOMAINS.map((d, i) => {
        const status = poolStatuses[d];
        const accent = DOMAIN_ACCENTS[d];
        return (
          <div
            key={d}
            className="relative overflow-hidden rounded-xl border border-border-soft bg-surface p-4.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all animate-fade-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: accent }} />
            <div className="text-[22px] font-extrabold mb-0.5" style={{ color: accent }}>
              {d}
            </div>
            <div className="text-[12.5px] text-ink-dim mb-3.5 min-h-[32px]">{DOMAIN_TITLES[d]}</div>
            <div className="text-[13px] text-ink-muted mb-3">
              {status.remaining} / {status.total} remaining
              <span className="text-ink-faint ml-1">({status.seen} seen)</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Btn look="fill" size="sm" onClick={() => onStart(d)}>
                Start drill
              </Btn>
              {status.seen > 0 && (
                <Btn look="ghost" size="sm" onClick={() => onResetSeen(d)}>
                  Reset seen
                </Btn>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
