"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LessonCard } from "@/components/LessonCard";
import { QuizCard } from "@/components/QuizCard";
import { Mascot } from "@/components/Mascot";
import { useQuest } from "@/components/QuestProvider";
import {
  buildQuizOptions,
  buildSession,
  nextStatus,
  requeuePosition,
} from "@/lib/spacedRepetition";
import { POINTS_PER_WORD, SESSION_SIZE, type Word, type WordStatus } from "@/lib/types";

/**
 * Lesson sessions of up to 10 words. Each word goes through:
 * study (see English + image → guess mentally → reveal Konkani + mnemonic)
 * → quiz (pick the Konkani word from 4 options) → instant feedback.
 * Correct answers earn 10 XP; wrong answers requeue the word so it comes
 * back a couple of cards later (spaced repetition).
 */
export default function LearnPage() {
  const { loading, words } = useQuest();
  const [sessionIndex, setSessionIndex] = useState(0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Mascot size={90} className="animate-wiggle" />
        <p className="font-extrabold text-ink-soft">Packing your lesson bag…</p>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center animate-pop-in">
        <Mascot size={120} className="animate-float" />
        <h2 className="text-2xl font-extrabold text-sea-deep">No words yet!</h2>
        <p className="max-w-sm font-semibold text-ink-soft">
          Ask your admin to add some words, then come back for your first quest.
        </p>
      </div>
    );
  }

  return (
    <LearnSession
      key={sessionIndex}
      salt={sessionIndex}
      onNewSession={() => setSessionIndex((i) => i + 1)}
    />
  );
}

function LearnSession({
  salt,
  onNewSession,
}: {
  salt: number;
  onNewSession: () => void;
}) {
  const { words, progress, completeWord } = useQuest();

  // Session queue is snapshotted once on mount (lazy initializer);
  // requeues and completions then mutate it via state updates only.
  const [queue, setQueue] = useState<string[]>(() =>
    buildSession(words, progress, SESSION_SIZE, salt).map((w) => w.id)
  );
  const [total] = useState(() => queue.length);
  const [phase, setPhase] = useState<"study" | "quiz">("study");
  const [turn, setTurn] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [completed, setCompleted] = useState(0);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  const wordById = useMemo(() => new Map(words.map((w) => [w.id, w])), [words]);
  const statusOf = useMemo(() => {
    const map = new Map<string, WordStatus>();
    for (const p of progress) map.set(p.word_id, p.status);
    return map;
  }, [progress]);

  const current: Word | undefined = wordById.get(queue[0] ?? "");

  async function handleQuizContinue(correct: boolean) {
    if (!current) return;
    const hadWrong = wrongIds.includes(current.id);

    if (correct) {
      const status = nextStatus(statusOf.get(current.id) ?? "new", true, hadWrong);
      await completeWord(current.id, status, true);
      setXpEarned((xp) => xp + POINTS_PER_WORD);
      setCompleted((c) => c + 1);
      if (!hadWrong) setFirstTryCorrect((c) => c + 1);
      setQueue((q) => q.slice(1));
    } else {
      await completeWord(current.id, "learning", false);
      setWrongIds((ids) => (hadWrong ? ids : [...ids, current.id]));
      setQueue((q) => {
        const rest = q.slice(1);
        const pos = requeuePosition(rest.length);
        return [...rest.slice(0, pos), current.id, ...rest.slice(pos)];
      });
    }
    setTurn((t) => t + 1);
    setPhase("study");
  }

  if (!current) {
    return (
      <SessionSummary
        total={total}
        firstTryCorrect={firstTryCorrect}
        xpEarned={xpEarned}
        onNewSession={onNewSession}
      />
    );
  }

  const pct = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-between text-xs font-extrabold text-ink-soft mb-1">
          <span>
            Word {Math.min(completed + 1, total)} of {total}
          </span>
          <span>⚡ +{xpEarned} XP this session</span>
        </div>
        <div className="h-3.5 rounded-full bg-sand-deep overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-mango to-coral transition-all duration-500"
            style={{ width: `${Math.max(pct, 3)}%` }}
          />
        </div>
        {wrongIds.includes(current.id) && phase === "study" && (
          <p className="mt-1.5 text-center text-xs font-extrabold text-coral-deep animate-pop-in">
            🌊 Round two — read the mnemonic carefully this time!
          </p>
        )}
      </div>

      {phase === "study" ? (
        <LessonCard
          key={`study:${current.id}:${turn}`}
          word={current}
          onContinue={() => setPhase("quiz")}
        />
      ) : (
        <QuizCard
          key={`quiz:${current.id}:${turn}`}
          word={current}
          options={buildQuizOptions(current, words, salt * 1000 + turn)}
          onContinue={handleQuizContinue}
        />
      )}
    </div>
  );
}

function SessionSummary({
  total,
  firstTryCorrect,
  xpEarned,
  onNewSession,
}: {
  total: number;
  firstTryCorrect: number;
  xpEarned: number;
  onNewSession: () => void;
}) {
  const perfect = firstTryCorrect === total;

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-5 text-center animate-pop-in">
      <Mascot size={130} className="animate-float" />
      <div>
        <h2 className="text-3xl font-extrabold text-sea-deep">
          {perfect ? "Flawless session! 🌟" : "Session complete! 🎉"}
        </h2>
        <p className="mt-1 font-semibold text-ink-soft">
          {perfect
            ? "Every single word on the first try — shabas!"
            : "Every wave makes the sailor — nice work!"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        <div className="rounded-2xl bg-white border-2 border-sand-deep shadow p-4">
          <p className="text-3xl" aria-hidden>⚡</p>
          <p className="text-2xl font-extrabold text-ink">+{xpEarned}</p>
          <p className="text-xs font-bold text-ink-soft uppercase tracking-wide">XP earned</p>
        </div>
        <div className="rounded-2xl bg-white border-2 border-sand-deep shadow p-4">
          <p className="text-3xl" aria-hidden>🎯</p>
          <p className="text-2xl font-extrabold text-ink">
            {firstTryCorrect}/{total}
          </p>
          <p className="text-xs font-bold text-ink-soft uppercase tracking-wide">First try</p>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <button
          type="button"
          onClick={onNewSession}
          className="btn-chunky w-full bg-palm border-palm-deep text-white text-lg font-extrabold py-4 px-6 shadow-lg cursor-pointer"
        >
          🚀 Start a new session
        </button>
        <Link
          href="/progress"
          className="btn-chunky block w-full bg-white border-sand-deep text-sea-deep text-lg font-extrabold py-4 px-6 shadow"
        >
          📈 See my progress
        </Link>
      </div>
    </div>
  );
}
