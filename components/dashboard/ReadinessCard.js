const TIER_GRADIENTS = {
  none: "from-slate-400 to-slate-600",
  low: "from-red-400 to-red-600",
  mid: "from-orange-400 to-amber-600",
  good: "from-accent to-accent-2",
  ready: "from-emerald-500 to-emerald-700",
};

export default function ReadinessCard({ readinessPct, verdict, tier }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl p-7 mb-6 text-white shadow-md bg-gradient-to-br ${TIER_GRADIENTS[tier]} animate-fade-up`}
    >
      <div className="absolute -right-14 -top-14 w-56 h-56 rounded-full bg-white/15 pointer-events-none" />
      <div className="relative grid gap-6 md:grid-cols-[280px_1fr] items-center">
        <div>
          <div className="text-[11px] uppercase tracking-widest font-bold opacity-85">Exam readiness</div>
          <div className="text-6xl font-extrabold leading-none mt-1.5 animate-scale-in">
            {readinessPct}
            <span className="text-3xl font-semibold opacity-70 ml-0.5">%</span>
          </div>
          <div className="text-[14.5px] font-semibold opacity-95 mt-1">{verdict}</div>
        </div>
        <div>
          <p className="text-[13px] leading-relaxed opacity-90 mb-3">
            Weighted across all five domains by official exam weighting (27 / 18 / 20 / 20 / 15).
            Coverage capped at 30% — small samples don&apos;t earn a high score.
          </p>
          <div className="h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-white/90 transition-[width] duration-700 ease-out"
              style={{ width: `${readinessPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
