import Link from "next/link";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "D1", label: "Domain 1" },
  { value: "D2", label: "Domain 2" },
  { value: "D3", label: "Domain 3" },
  { value: "D4", label: "Domain 4" },
  { value: "D5", label: "Domain 5" },
];

export default function FilterChips({ active }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {FILTERS.map((f) => (
        <Link
          key={f.value}
          href={f.value === "all" ? "/anti-patterns" : `/anti-patterns?filter=${f.value}`}
          className={`rounded-full px-4 py-1.5 text-[13px] font-medium border transition-all ${
            active === f.value
              ? "bg-accent text-white border-transparent shadow-sm"
              : "bg-surface text-ink-muted border-border hover:border-accent hover:text-accent-700"
          }`}
        >
          {f.label}
        </Link>
      ))}
    </div>
  );
}
