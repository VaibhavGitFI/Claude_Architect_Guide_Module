"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import Bar from "@/components/ui/Bar";
import { DOMAINS, DOMAIN_TITLES, DOMAIN_ACCENTS, EXAM_WEIGHTS } from "@/lib/constants";

export default function DomainMasteryGrid({ perD }) {
  return (
    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-7">
      {DOMAINS.map((d, i) => {
        const s = perD[d];
        const accPct = Math.round(s.accuracy * 100);
        const covPct = Math.round(s.coverage * 100);
        const accent = DOMAIN_ACCENTS[d];
        return (
          <Card
            key={d}
            hover
            className="p-4 flex flex-col relative overflow-hidden animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: accent }} />
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="font-extrabold text-[13px] px-2.5 py-0.5 rounded-full"
                style={{ background: `${accent}1a`, color: accent }}
              >
                {d}
              </span>
              <span className="text-[10.5px] font-semibold text-ink-dim uppercase tracking-wide">
                {Math.round(EXAM_WEIGHTS[d] * 100)}% weight
              </span>
            </div>
            <div className="text-[13.5px] font-semibold mb-3.5">{DOMAIN_TITLES[d]}</div>

            <div className="grid grid-cols-2 gap-3 mb-3.5">
              <div>
                <div className="text-2xl font-extrabold leading-none" style={{ color: accent }}>
                  {accPct}%
                </div>
                <div className="text-[10.5px] text-ink-dim font-semibold uppercase tracking-wide mt-1">
                  Accuracy <span className="normal-case font-normal">({s.correctCount}/{s.attemptsCount})</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold leading-none">
                  {s.attempted}
                  <span className="text-sm font-medium text-ink-faint">/{s.poolSize}</span>
                </div>
                <div className="text-[10.5px] text-ink-dim font-semibold uppercase tracking-wide mt-1">
                  Coverage <span className="normal-case font-normal">({covPct}%)</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-3.5">
              <div className="grid grid-cols-[54px_1fr] items-center gap-2">
                <span className="text-[10.5px] text-ink-dim font-semibold uppercase">Acc.</span>
                <Bar value={accPct} color={accent} h={6} />
              </div>
              <div className="grid grid-cols-[54px_1fr] items-center gap-2">
                <span className="text-[10.5px] text-ink-dim font-semibold uppercase">Cov.</span>
                <Bar value={covPct} color={`${accent}90`} h={6} />
              </div>
            </div>

            <Link
              href={`/quiz?domain=${d}&autostart=1`}
              className="mt-auto text-center rounded-md py-2 text-[13px] font-semibold text-white bg-accent hover:bg-accent-600 transition-colors shadow-sm"
            >
              Practise {d}
            </Link>
          </Card>
        );
      })}
    </div>
  );
}
