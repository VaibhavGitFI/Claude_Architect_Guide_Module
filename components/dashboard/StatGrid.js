import Card from "@/components/ui/Card";

function Stat({ value, label, delay = 0 }) {
  return (
    <Card className="text-center py-6 animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="text-4xl font-extrabold bg-gradient-to-br from-accent to-accent-2 bg-clip-text text-transparent leading-none animate-count-up">
        {value}
      </div>
      <div className="text-[12px] text-ink-dim mt-2 uppercase tracking-wide font-semibold">{label}</div>
    </Card>
  );
}

export default function StatGrid({ totalQuestions, attempted, accuracy, bestMock }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Stat value={totalQuestions} label="Bank size" delay={0} />
      <Stat value={attempted} label="Questions answered" delay={60} />
      <Stat value={attempted ? `${accuracy}%` : "—"} label="Overall accuracy" delay={120} />
      <Stat value={bestMock === null ? "—" : `${bestMock}%`} label="Best mock score" delay={180} />
    </div>
  );
}
