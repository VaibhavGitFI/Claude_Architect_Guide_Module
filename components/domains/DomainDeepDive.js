import Link from "next/link";
import ContentBlocks from "@/components/ui/ContentBlocks";
import InlineMarkdown from "@/components/ui/InlineMarkdown";
import { DOMAINS, DOMAIN_ACCENTS } from "@/lib/constants";

export default function DomainDeepDive({ domain, dd }) {
  const accent = DOMAIN_ACCENTS[domain];
  const idx = DOMAINS.indexOf(domain);
  const prev = idx > 0 ? DOMAINS[idx - 1] : null;
  const next = idx < DOMAINS.length - 1 ? DOMAINS[idx + 1] : null;

  return (
    <article className="bg-surface border border-border-soft rounded-xl overflow-hidden shadow-sm animate-fade-up">
      <div
        className="relative p-9 pb-8 text-white overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
      >
        <div className="absolute -right-14 -top-14 w-64 h-64 rounded-full bg-white/15 pointer-events-none" />
        <div className="relative text-[11.5px] uppercase tracking-widest font-semibold opacity-85 mb-2.5">
          Domain {dd.number} · {dd.weight} of exam
        </div>
        <h1 className="relative text-3xl font-bold mb-2.5 leading-tight">{dd.title}</h1>
        <p className="relative text-[16px] opacity-95 max-w-2xl">{dd.tagline}</p>
      </div>

      <div className="px-9 py-5 bg-accent-soft border-b border-border-soft">
        <div className="text-[11px] font-bold uppercase tracking-wide text-accent-700 mb-1.5">
          Why this domain matters
        </div>
        <p className="text-[15px] leading-relaxed text-ink-muted">
          <InlineMarkdown text={dd.why} />
        </p>
      </div>

      {dd.sections.map((sec, i) => (
        <section key={i} className="relative px-9 py-7 border-b border-border-soft last:border-b-0">
          <div className="flex items-start gap-4">
            <div
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[13px] shadow"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
            >
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold mb-4">{sec.heading}</h2>
              <ContentBlocks blocks={sec.body} />
            </div>
          </div>
        </section>
      ))}

      <div className="mx-9 my-6 rounded-lg p-5 bg-gradient-to-br from-accent-soft to-blue-50">
        <h3 className="text-[12px] font-bold uppercase tracking-wide text-accent-700 mb-2.5">
          What the exam tests in this domain
        </h3>
        <ul className="list-disc pl-5 space-y-1.5">
          {dd.examFocus.map((f, i) => (
            <li key={i} className="text-[14.5px] text-ink-muted">
              <InlineMarkdown text={f} />
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-9 mb-7 rounded-lg p-5 bg-gradient-to-br from-amber-50 to-orange-50">
        <h3 className="text-[12px] font-bold uppercase tracking-wide text-amber-700 mb-2.5">Quick Reference</h3>
        <ul className="list-disc pl-5 space-y-1.5">
          {dd.quickRef.map((r, i) => (
            <li key={i} className="text-[14.5px] text-ink-muted">
              <InlineMarkdown text={r} />
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-9 mb-9 pt-5 border-t border-border-soft grid grid-cols-2 gap-3.5">
        {prev ? (
          <Link
            href={`/domains?domain=${prev}`}
            className="rounded-lg border border-border-soft p-3.5 hover:border-accent hover:bg-accent-soft transition-colors"
          >
            <div className="text-[11px] font-bold uppercase tracking-wide text-ink-dim">← Previous</div>
            <div className="text-sm mt-1 font-medium">Domain {prev.replace("D", "")}</div>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/domains?domain=${next}`}
            className="rounded-lg border border-border-soft p-3.5 text-right hover:border-accent hover:bg-accent-soft transition-colors"
          >
            <div className="text-[11px] font-bold uppercase tracking-wide text-ink-dim">Next →</div>
            <div className="text-sm mt-1 font-medium">Domain {next.replace("D", "")}</div>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </article>
  );
}
