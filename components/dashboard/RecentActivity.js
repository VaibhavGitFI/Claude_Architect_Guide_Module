import Card from "@/components/ui/Card";

export default function RecentActivity({ history }) {
  if (!history.length) {
    return (
      <Card className="p-5 text-center text-ink-dim text-sm border-dashed mb-7">
        No mock or real exam attempts yet — they&apos;ll appear here once you&apos;ve sat one.
      </Card>
    );
  }
  return (
    <div className="space-y-2 mb-7">
      {history.slice(0, 5).map((h, i) => {
        const date = new Date(h.ts);
        const dateStr = date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
        const pass = h.passMark != null && h.score / h.total >= h.passMark;
        const mins = Math.floor(h.durationSec / 60);
        const secs = h.durationSec % 60;
        return (
          <Card
            key={i}
            className="p-3.5 grid grid-cols-2 md:grid-cols-4 gap-3 items-center text-sm animate-fade-up"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="font-bold text-accent-700">{h.mode === "real" ? "Real Exam Sim" : "Mock Exam"}</div>
            <div className="font-semibold">
              {h.pct}% <span className="text-ink-dim font-normal">({h.score}/{h.total})</span>
              {h.passMark != null && (
                <span
                  className={`ml-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${
                    pass ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad"
                  }`}
                >
                  {pass ? "PASS" : "FAIL"}
                </span>
              )}
            </div>
            <div className="text-ink-dim text-[13px]">
              {mins}m {secs}s
            </div>
            <div className="text-ink-dim text-[13px] md:text-right">{dateStr}</div>
          </Card>
        );
      })}
    </div>
  );
}
