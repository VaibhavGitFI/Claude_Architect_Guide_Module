import Link from "next/link";
import { DOMAINS } from "@/lib/constants";

export default function StudySidebarNav({ activeDomain, activeTopic, studyContents }) {
  return (
    <aside className="lg:w-72 shrink-0">
      <div className="lg:sticky lg:top-0 bg-surface border border-border-soft rounded-xl p-3.5 shadow-sm max-h-[calc(100vh-140px)] overflow-y-auto">
        {DOMAINS.map((d) => {
          const sc = studyContents[d];
          const shortTitle = sc.title.replace("Domain ", "D").split(" —")[0];
          return (
            <div key={d} className="mb-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-ink-dim px-2 pt-2 pb-1.5">
                {shortTitle} · {sc.weight}
              </div>
              <Link
                href={`/study?domain=${d}`}
                className={`block rounded-md px-3 py-2 mb-0.5 text-[13px] transition-colors ${
                  activeDomain === d && !activeTopic
                    ? "bg-accent-soft text-accent-700 font-semibold"
                    : "text-ink-muted hover:bg-accent-soft/60"
                }`}
              >
                Overview
              </Link>
              {sc.topics.map((t) => (
                <Link
                  key={t.id}
                  href={`/study?domain=${d}&topic=${t.id}`}
                  className={`block rounded-md px-3 py-2 mb-0.5 text-[13px] transition-colors ${
                    activeDomain === d && activeTopic === t.id
                      ? "bg-accent-soft text-accent-700 font-semibold"
                      : "text-ink-muted hover:bg-accent-soft/60"
                  }`}
                >
                  {t.id} {t.title}
                </Link>
              ))}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
