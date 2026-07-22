import Link from "next/link";
import { DOMAINS } from "@/lib/constants";

// Secondary in-page nav (distinct from the primary app sidebar) — lists the
// 5 domains for the Domains / Study Guide views. Plain <Link>s so this is a
// zero-JS server-rendered island; the active domain comes from the URL.
export default function DomainSidebarNav({ basePath, activeDomain, deepDives }) {
  return (
    <aside className="lg:w-72 shrink-0">
      <div className="lg:sticky lg:top-0 bg-surface border border-border-soft rounded-xl p-3.5 shadow-sm">
        <div className="text-[11px] font-bold uppercase tracking-wide text-ink-dim px-2 pt-2 pb-1.5">
          Domain
        </div>
        {DOMAINS.map((d) => {
          const dd = deepDives[d];
          const active = d === activeDomain;
          return (
            <Link
              key={d}
              href={`${basePath}?domain=${d}`}
              className={`block rounded-md px-3 py-2.5 mb-0.5 transition-colors ${
                active ? "bg-accent-soft text-accent-700 font-semibold" : "text-ink-muted hover:bg-accent-soft/60"
              }`}
            >
              <div className="text-[13.5px] font-semibold">
                Domain {dd.number} <span className="font-normal text-ink-faint">· {dd.weight}</span>
              </div>
              <div className="text-[12px] text-ink-dim mt-0.5">{dd.title}</div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
