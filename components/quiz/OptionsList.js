const LETTERS = ["A", "B", "C", "D"];

// Dual-purpose: pass `revealed=false` for pure selection (Mock/Real Exam
// in-progress navigation) or `revealed=true` to show correct/wrong coloring
// + per-option rationale (Domain Quiz instant feedback, and exam review).
export default function OptionsList({ options, selected, correctIndex, rationales, revealed, onSelect, disabled }) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((opt, i) => {
        const isSelected = selected === i;
        const isCorrect = revealed && i === correctIndex;
        const isWrongPicked = revealed && isSelected && i !== correctIndex;
        return (
          <div key={i}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect?.(i)}
              className={`w-full flex items-start gap-3 rounded-lg border-2 px-4 py-3.5 text-left text-[14.5px] transition-all ${
                isCorrect
                  ? "border-ok bg-ok-soft animate-correct-pulse"
                  : isWrongPicked
                    ? "border-bad bg-bad-soft animate-wrong-shake"
                    : isSelected
                      ? "border-accent bg-accent-soft"
                      : "border-border hover:border-accent hover:bg-accent-soft/60 hover:translate-x-0.5"
              } ${disabled && !revealed ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span
                className={`shrink-0 w-7 h-7 rounded-full border-[1.5px] flex items-center justify-center font-bold text-[12.5px] transition-colors ${
                  isCorrect
                    ? "bg-ok text-white border-ok"
                    : isWrongPicked
                      ? "bg-bad text-white border-bad"
                      : isSelected
                        ? "bg-accent text-white border-accent"
                        : "border-border text-ink-muted"
                }`}
              >
                {LETTERS[i]}
              </span>
              <span className="flex-1 pt-0.5">{opt}</span>
              {!revealed && (
                <span className="shrink-0 text-[11px] font-semibold text-ink-faint bg-black/5 rounded px-1.5 py-0.5">
                  {i + 1}
                </span>
              )}
            </button>
            {revealed && rationales && (
              <div
                className={`flex gap-3 rounded-lg px-3.5 py-2.5 mt-1.5 text-[13px] leading-relaxed animate-fade-up ${
                  i === correctIndex
                    ? "bg-ok-soft border-l-4 border-l-ok"
                    : isSelected
                      ? "bg-bad-soft border-l-4 border-l-bad"
                      : "bg-background border-l-4 border-l-border"
                }`}
              >
                <span className="font-bold shrink-0">{LETTERS[i]}</span>
                <div>
                  <div className="text-[10.5px] font-bold uppercase tracking-wide text-ink-dim mb-0.5">
                    {i === correctIndex ? "Why right" : "Why wrong"}
                  </div>
                  <div className="text-ink-muted">{rationales[i]}</div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
