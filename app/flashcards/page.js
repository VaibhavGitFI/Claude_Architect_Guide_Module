"use client";

import { useState, useCallback, useMemo } from "react";
import flashcards from "@/lib/data/flashcards.json";
import { useUser } from "@/lib/useUser";
import { getProgress, setFlashStat } from "@/lib/progress";
import { DOMAIN_ACCENTS } from "@/lib/constants";
import Btn from "@/components/ui/Btn";

export default function FlashcardsPage() {
  const { user, ready } = useUser();
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  // Bumped after each mark() to force `stats` to recompute; localStorage
  // itself isn't reactive, so this stands in for a real change subscription.
  const [statsVersion, setStatsVersion] = useState(0);

  const stats = useMemo(() => {
    if (!ready) return null;
    const p = getProgress(user);
    const values = Object.values(p.flashStats || {});
    return {
      knew: values.filter((v) => v === "knew").length,
      missed: values.filter((v) => v === "missed").length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user, statsVersion]);

  const card = flashcards[idx];
  const accent = card?.domain ? DOMAIN_ACCENTS[card.domain] : "var(--accent)";

  const goto = useCallback(
    (delta) => {
      setIdx((i) => (i + delta + flashcards.length) % flashcards.length);
      setFlipped(false);
    },
    []
  );

  const mark = useCallback(
    (stat) => {
      setFlashStat(user, card.id, stat);
      setStatsVersion((v) => v + 1);
      goto(1);
    },
    [user, card, goto]
  );

  const total = flashcards.length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Flashcards</h1>
      <p className="text-ink-dim text-[15px] mb-6">Quick recall drills — flip the card, mark whether you knew it.</p>

      <div className="max-w-2xl mx-auto">
        <div className="[perspective:1200px] mb-5">
          <div
            onClick={() => setFlipped((f) => !f)}
            className="relative min-h-[260px] cursor-pointer transition-transform duration-500 [transform-style:preserve-3d]"
            style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center rounded-xl border border-border-soft bg-surface shadow-md p-9 [backface-visibility:hidden]"
              style={{ borderTop: `4px solid ${accent}` }}
            >
              {card?.domain && (
                <span className="absolute top-4 left-4 text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: `${accent}1a`, color: accent }}>
                  {card.domain}
                </span>
              )}
              <div className="text-lg leading-relaxed">{card?.front}</div>
              <div className="absolute bottom-4 text-[11px] text-ink-faint uppercase tracking-wide">Tap to flip</div>
            </div>
            {/* Back */}
            <div
              className="absolute inset-0 flex items-center justify-center text-center rounded-xl border border-border-soft bg-gradient-to-br from-accent-soft to-blue-50 shadow-md p-9 [backface-visibility:hidden]"
              style={{ transform: "rotateY(180deg)" }}
            >
              <div className="text-[15px] leading-relaxed text-accent-700 font-medium">{card?.back}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 flex-wrap justify-center mb-4">
          <Btn look="ghost" onClick={() => goto(-1)}>
            ← Prev
          </Btn>
          <Btn onClick={() => setFlipped((f) => !f)}>Flip</Btn>
          <Btn look="success" onClick={() => mark("knew")}>
            I knew it
          </Btn>
          <Btn look="danger" onClick={() => mark("missed")}>
            Missed
          </Btn>
          <Btn look="ghost" onClick={() => goto(1)}>
            Next →
          </Btn>
        </div>

        <div className="text-center text-ink-dim text-[13px]">
          Card {idx + 1} of {total} • Knew: {stats?.knew ?? 0} • Missed: {stats?.missed ?? 0}
        </div>
      </div>
    </div>
  );
}
