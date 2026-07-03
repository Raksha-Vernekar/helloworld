"use client";

import { useMemo, useState } from "react";
import { LessonCard } from "@/components/LessonCard";
import { Mascot } from "@/components/Mascot";
import { useQuest } from "@/components/QuestProvider";
import { burstConfetti } from "@/lib/confetti";

/**
 * Practice flow: revisits words the user has already seen (learning or
 * mastered), shuffled, so memories stay fresh. Correct recalls still
 * earn 10 XP.
 */
export default function PracticePage() {
  const { loading, words, progress, completeWord } = useQuest();
  const [round, setRound] = useState(0);

  const seenWords = useMemo(() => {
    const seenIds = new Set(progress.map((p) => p.word_id));
    const list = words.filter((w) => seenIds.has(w.id));
    // Deterministic shuffle per round so the card changes on every answer.
    return [...list].sort((a, b) => {
      const ha = hashCode(`${a.id}:${round}`);
      const hb = hashCode(`${b.id}:${round}`);
      return ha - hb;
    });
  }, [words, progress, round]);

  const current = seenWords[0];

  async function handleRemembered() {
    if (!current) return;
    const entry = progress.find((p) => p.word_id === current.id);
    const nextStatus = entry?.status === "new" ? "learning" : "mastered";
    burstConfetti();
    await completeWord(current.id, nextStatus, true);
    setRound((r) => r + 1);
  }

  async function handlePracticeAgain() {
    if (!current) return;
    await completeWord(current.id, "learning", false);
    setRound((r) => r + 1);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Mascot size={90} className="animate-wiggle" />
        <p className="font-extrabold text-ink-soft">Shuffling your deck…</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center animate-pop-in">
        <Mascot size={120} className="animate-float" />
        <h2 className="text-2xl font-extrabold text-sea-deep">
          Nothing to practice yet!
        </h2>
        <p className="max-w-sm font-semibold text-ink-soft">
          Learn a few words first — then come back here to keep them sharp. 💪
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm font-extrabold text-ink-soft">
        Practice round · {seenWords.length} word{seenWords.length === 1 ? "" : "s"} in
        rotation
      </p>
      <LessonCard
        key={`${current.id}:${round}`}
        word={current}
        onRemembered={handleRemembered}
        onPracticeAgain={handlePracticeAgain}
      />
    </div>
  );
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
