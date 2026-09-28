"use client";

import { useMemo, useState } from "react";
import { Mascot } from "@/components/Mascot";
import { FunFactModal } from "@/components/FunFactModal";
import { useQuest } from "@/components/QuestProvider";
import type { FunFact, WordStatus } from "@/lib/types";

const STATUS_STYLES: Record<WordStatus, { label: string; classes: string }> = {
  new: { label: "New", classes: "bg-sand-deep text-ink-soft" },
  learning: { label: "Learning", classes: "bg-mango/25 text-mango-deep" },
  mastered: { label: "Mastered", classes: "bg-palm/20 text-palm-deep" },
};

export default function ProgressPage() {
  const { loading, profile, words, progress, funFacts, unlockedFacts } = useQuest();
  const [factToShow, setFactToShow] = useState<FunFact | null>(null);

  const statusOf = useMemo(() => {
    const map = new Map<string, WordStatus>();
    for (const p of progress) map.set(p.word_id, p.status);
    return map;
  }, [progress]);

  const counts = useMemo(() => {
    let learning = 0;
    let mastered = 0;
    for (const w of words) {
      const s = statusOf.get(w.id);
      if (s === "learning") learning++;
      if (s === "mastered") mastered++;
    }
    return {
      learning,
      mastered,
      total: words.length,
      newCount: words.length - learning - mastered,
    };
  }, [words, statusOf]);

  if (loading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Mascot size={90} className="animate-wiggle" />
        <p className="font-extrabold text-ink-soft">Charting your voyage…</p>
      </div>
    );
  }

  const masteredPct =
    counts.total > 0 ? Math.round((counts.mastered / counts.total) * 100) : 0;

  return (
    <div className="space-y-6 animate-pop-in">
      <section className="rounded-3xl bg-white border-2 border-sand-deep shadow-md p-5 text-center">
        <h2 className="text-xl font-extrabold text-sea-deep">Your voyage so far</h2>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Stat emoji="⚡" value={profile.points} label="XP" />
          <Stat emoji="🔥" value={profile.streak} label="Day streak" />
          <Stat emoji="🏆" value={counts.mastered} label="Mastered" />
        </div>

        <div className="mt-5">
          <div className="flex justify-between text-xs font-extrabold text-ink-soft mb-1">
            <span>Words mastered</span>
            <span>
              {counts.mastered}/{counts.total} ({masteredPct}%)
            </span>
          </div>
          <div className="h-4 rounded-full bg-sand-deep overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-palm to-lagoon transition-all duration-700"
              style={{ width: `${Math.max(masteredPct, 2)}%` }}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-extrabold text-ink mb-2">🎁 Fun facts</h3>
        {funFacts.length === 0 ? (
          <p className="text-sm font-semibold text-ink-soft">
            No fun facts yet — ask your admin to add some!
          </p>
        ) : (
          <ul className="space-y-2">
            {funFacts.map((f) => {
              const unlocked = unlockedFacts.some((u) => u.id === f.id);
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    disabled={!unlocked}
                    onClick={() => setFactToShow(f)}
                    className={`w-full text-left rounded-2xl border-2 px-4 py-3 font-semibold text-sm transition-colors ${
                      unlocked
                        ? "bg-mango/10 border-mango/40 text-ink hover:bg-mango/20 cursor-pointer"
                        : "bg-sand-deep/60 border-sand-deep text-ink-soft cursor-not-allowed"
                    }`}
                  >
                    <span className="font-extrabold mr-2">
                      {unlocked ? "🔓" : "🔒"} {f.unlock_points} XP
                    </span>
                    {unlocked
                      ? f.fact_text
                      : `Reach ${f.unlock_points} XP to unlock this fact`}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-lg font-extrabold text-ink mb-2">📚 Word list</h3>
        <ul className="space-y-2">
          {words.map((w) => {
            const status = statusOf.get(w.id) ?? "new";
            const style = STATUS_STYLES[status];
            return (
              <li
                key={w.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white border-2 border-sand-deep px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-extrabold text-ink truncate">
                    {w.english_word}{" "}
                    <span className="text-sea-deep">→ {w.konkani_word}</span>
                  </p>
                  <p className="text-xs font-semibold text-ink-soft truncate">
                    {w.category} · {w.difficulty}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-extrabold ${style.classes}`}
                >
                  {style.label}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {factToShow && (
        <FunFactModal fact={factToShow} onClose={() => setFactToShow(null)} />
      )}
    </div>
  );
}

function Stat({ emoji, value, label }: { emoji: string; value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-sand p-3">
      <p className="text-2xl" aria-hidden>
        {emoji}
      </p>
      <p className="text-xl font-extrabold text-ink">{value}</p>
      <p className="text-xs font-bold text-ink-soft uppercase tracking-wide">{label}</p>
    </div>
  );
}
