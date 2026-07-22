import { DOMAINS, DOMAIN_TITLES, EXAM_WEIGHTS } from "@/lib/constants";

const FOCUS = {
  D1: "Loops, hub-and-spoke, hooks, sessions",
  D2: "Descriptions, errors, MCP, built-ins",
  D3: "CLAUDE.md, commands, plan mode, CI/CD",
  D4: "Criteria, tool_use, validation, few-shot",
  D5: "Case facts, escalation, provenance",
};

export default function WeightsTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-border-soft shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-border-soft/60">
            <th className="text-left px-3.5 py-2.5 font-semibold text-[12px] uppercase tracking-wide">Domain</th>
            <th className="text-left px-3.5 py-2.5 font-semibold text-[12px] uppercase tracking-wide">Weight</th>
            <th className="text-left px-3.5 py-2.5 font-semibold text-[12px] uppercase tracking-wide">Focus</th>
          </tr>
        </thead>
        <tbody>
          {DOMAINS.map((d, i) => (
            <tr key={d} className={i < DOMAINS.length - 1 ? "border-b border-border-soft" : ""}>
              <td className="px-3.5 py-2.5">
                {d}. {DOMAIN_TITLES[d]}
              </td>
              <td className="px-3.5 py-2.5 font-semibold">{Math.round(EXAM_WEIGHTS[d] * 100)}%</td>
              <td className="px-3.5 py-2.5 text-ink-dim">{FOCUS[d]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
