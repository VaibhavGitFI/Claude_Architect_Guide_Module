import antiPatterns from "@/lib/data/anti-patterns.json";
import FilterChips from "@/components/antipatterns/FilterChips";
import AntiPatternCard from "@/components/antipatterns/AntiPatternCard";

export const metadata = { title: "Anti-Patterns — Claude Certified Architect" };

const SEVERITIES = ["critical", "high", "medium"];

export default async function AntiPatternsPage({ searchParams }) {
  const sp = await searchParams;
  const filter = sp?.filter || "all";

  const filtered = antiPatterns.filter((ap) => {
    if (filter === "all") return true;
    if (SEVERITIES.includes(filter)) return ap.severity === filter;
    return ap.domain === filter;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Anti-Patterns Cheatsheet</h1>
      <p className="text-ink-dim text-[15px] max-w-3xl mb-5">
        The most common wrong answers and distractors on the Claude Certified Architect exam. Memorize
        these to instantly eliminate 2–3 options before reading the correct answer.
      </p>
      <FilterChips active={filter} />
      <div className="flex flex-col gap-3">
        {filtered.map((ap, i) => (
          <AntiPatternCard key={ap.id} ap={ap} index={i} />
        ))}
      </div>
    </div>
  );
}
