"use client";

import { useMemo, useState } from "react";
import { LessonCard } from "@/components/LessonCard";
import { Mascot } from "@/components/Mascot";
import { useQuest } from "@/components/QuestProvider";
import { burstConfetti } from "@/lib/confetti";
import type { WordStatus } from "@/lib/types";

/**
 * Learn flow: works through words the user hasn't mastered yet.
 * "I remembered it" advances the word (new → learning → mastered) and
 * awards 10 XP; "Practice again" sends it to the back of today's queue.
 */
export default function LearnPage() {
  const { loading, words, progress, completeWord } = useQuest();
  const [requeued, setRequeued] = useState<string[]>([]);

  const statusOf = useMemo(() => {
    const map = new Map<string, WordStatus>();
    for (const p of progress) map.set(p.word_id, p.status);
    return map;
  }, [progress]);

  const queue = useMemo(() => {
    const unmastered = words.filter((w) => statusOf.get(w.id) !== "mastered");
    const fresh = unmastered.filter((w) => !requeued.includes(w.id));
    const repeats = requeued
      .map((id) => unmastered.find((w) => w.id === id))
      .filter((w): w is NonNullable<typeof w> => Boolean(w));
    return [...fresh, ...repeats];
  }, [words, statusOf, requeued]);

  const current = queue[0];

  async function handleRemembered() {
    if (!current) return;
    const currentStatus = statusOf.get(current.id) ?? "new";
    const nextStatus: WordStatus =
      currentStatus === "learning" || currentStatus === "mastered"
        ? "mastered"
        : "learning";
    burstConfetti();
    await completeWord(current.id, nextStatus, true);
    setRequeued((r) => r.filter((id) => id !== current.id));
  }

  async function handlePracticeAgain() {
    if (!current) return;
    await completeWord(current.id, "learning", false);
    setRequeued((r) => [...r.filter((id) => id !== current.id), current.id]);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Mascot size={90} className="animate-wiggle" />
        <p className="font-extrabold text-ink-soft">Fetching your words…</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center animate-pop-in">
        <Mascot size={120} className="animate-float" />
        <h2 className="text-2xl font-extrabold text-sea-deep">
          Shabas! You mastered every word! 🎉
        </h2>
        <p className="max-w-sm font-semibold text-ink-soft">
          Head over to Practice to keep them fresh, or ask your admin to add
          more words to the quest.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm font-extrabold text-ink-soft">
        {queue.length} word{queue.length === 1 ? "" : "s"} left in today&apos;s quest
      </p>
      <LessonCard
        key={current.id}
        word={current}
        onRemembered={handleRemembered}
        onPracticeAgain={handlePracticeAgain}
      />
    </div>
  );
}
