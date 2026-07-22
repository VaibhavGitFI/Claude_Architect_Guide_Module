import Link from "next/link";
import Card from "@/components/ui/Card";

export default function NextActionCard({ action }) {
  if (!action) return null;
  return (
    <Card className="p-6 mb-7 border-l-4 border-l-accent grid gap-5 md:grid-cols-[1fr_auto] items-center animate-fade-up">
      <div>
        <span className="inline-block text-[10.5px] font-extrabold uppercase tracking-widest text-accent-700 bg-accent-soft px-2.5 py-0.5 rounded-full mb-2">
          Next action
        </span>
        <h3 className="text-[17px] font-semibold mb-1">{action.title}</h3>
        <p className="text-[13.5px] text-ink-dim leading-relaxed max-w-xl">{action.body}</p>
      </div>
      <Link
        href={`/${action.cta}`}
        className="whitespace-nowrap rounded-md px-5 py-2.5 text-[13px] font-semibold text-white bg-accent hover:bg-accent-600 shadow-sm hover:shadow-md hover:-translate-y-px transition-all text-center"
      >
        {action.ctaLabel}
      </Link>
    </Card>
  );
}
