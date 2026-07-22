import scenarios from "@/lib/data/scenarios.json";
import ScenarioCard from "@/components/scenarios/ScenarioCard";

export const metadata = { title: "Scenarios — Claude Certified Architect" };

export default function ScenariosPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">6 Exam Scenarios — Deep Dive</h1>
      <p className="text-ink-dim text-[15px] max-w-3xl mb-5">
        The exam randomly selects 4 of these 6 scenarios. Each walkthrough covers the key architectural
        decisions, correct approaches, common anti-patterns, and which domains are tested.
      </p>
      <div className="flex flex-col gap-4">
        {scenarios.map((s, i) => (
          <ScenarioCard key={s.id} scenario={s} index={i} />
        ))}
      </div>
    </div>
  );
}
