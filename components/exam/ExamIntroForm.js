import Card from "@/components/ui/Card";
import Btn from "@/components/ui/Btn";

export default function ExamIntroForm({
  loadedCount,
  totalAvailable,
  mode,
  count,
  setCount,
  countOptions,
  time,
  setTime,
  timeOptions,
  showSourceFilter,
  source,
  setSource,
  onStart,
  onResetSeen,
}) {
  let banner = null;
  if (loadedCount < 5) {
    banner = (
      <div className="rounded-lg bg-info-soft text-info px-4 py-3 mb-4 text-[13.5px]">
        Only {loadedCount} of 5 domains loaded. {mode === "mock" ? "Mock" : "Real Exam"} will draw from
        those and renormalise weights. {totalAvailable} questions available.
      </div>
    );
  }

  return (
    <div>
      {banner}
      <Card className="max-w-lg p-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <label className="text-[14px] text-ink-muted font-medium">Number of questions</label>
          <select
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value, 10))}
            className="border border-border rounded-md px-3 py-2 text-[14px] bg-surface"
          >
            {countOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between gap-3 mb-5">
          <label className="text-[14px] text-ink-muted font-medium">Time limit (minutes)</label>
          <select
            value={time}
            onChange={(e) => setTime(parseInt(e.target.value, 10))}
            className="border border-border rounded-md px-3 py-2 text-[14px] bg-surface"
          >
            {timeOptions.map((t) => (
              <option key={t} value={t}>
                {t === 0 ? "No limit" : t}
              </option>
            ))}
          </select>
        </div>
        {showSourceFilter && (
          <div className="flex items-center justify-between gap-3 mb-5">
            <label className="text-[14px] text-ink-muted font-medium">Source filter</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="border border-border rounded-md px-3 py-2 text-[14px] bg-surface"
            >
              <option value="all">All (sim + extras)</option>
              <option value="sim">Sim only</option>
              <option value="extra">Extras only</option>
            </select>
          </div>
        )}
        <div className="flex gap-3 pt-1">
          <Btn onClick={onStart}>Start {mode === "mock" ? "Mock Exam" : "Real Exam"}</Btn>
          <Btn look="ghost" onClick={onResetSeen}>
            Reset seen pool
          </Btn>
        </div>
      </Card>
    </div>
  );
}
