"use client";

import { useState } from "react";
import Image from "next/image";
import type { Word } from "@/lib/types";
import { burstConfetti } from "@/lib/confetti";

interface QuizCardProps {
  word: Word;
  options: string[];
  /** Called when the learner taps Continue. `correct` = first pick was right. */
  onContinue: (correct: boolean) => void;
}

const PRAISE = [
  "Shabas! Nailed it! 🎉",
  "Borem! You're on fire! 🔥",
  "Ekdum correct! ⭐",
  "That's the one! 🥥",
  "Konkani champion in the making! 🏆",
];

const ENCOURAGE = [
  "Almost! It'll stick next time. 💪",
  "No worries — tricky one! You'll see it again soon. 🌊",
  "Good try! The mnemonic will help next round. 🧠",
  "So close! Let's give it another go in a bit. 🦜",
];

function pickMessage(list: string[], seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}

/**
 * The quiz step: "Which is the Konkani word for X?" with 4 big options.
 * Instant feedback — correct turns green, wrong shakes red and reveals
 * the right answer — then a Continue button advances the session.
 */
export function QuizCard({ word, options, onContinue }: QuizCardProps) {
  const [picked, setPicked] = useState<string | null>(null);

  const answered = picked !== null;
  const correct = picked === word.konkani_word;

  return (
    <div className="animate-pop-in w-full max-w-md mx-auto rounded-[2rem] bg-white shadow-xl border-2 border-sand-deep overflow-hidden">
      <div className="relative w-full aspect-[3/1.6] bg-sand-deep">
        <Image
          src={word.image_url || "https://placehold.co/600x400/ffefd4/1e3a3a?text=Konkani+Quest"}
          alt={word.english_word}
          fill
          sizes="(max-width: 640px) 100vw, 448px"
          className="object-cover"
          unoptimized
        />
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-sea-deep shadow">
          Quiz time!
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-ink-soft">
            Which is the Konkani word for…
          </p>
          <h2 className="text-3xl font-extrabold text-ink">{word.english_word}?</h2>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {options.map((option) => {
            const isCorrectOption = option === word.konkani_word;
            const isPicked = option === picked;

            let classes =
              "bg-white border-sand-deep text-ink hover:border-lagoon hover:bg-lagoon/5";
            if (answered) {
              if (isCorrectOption) {
                classes = "bg-palm/15 border-palm text-palm-deep";
              } else if (isPicked) {
                classes = "bg-coral/15 border-coral text-coral-deep animate-wiggle";
              } else {
                classes = "bg-white border-sand-deep text-ink-soft opacity-60";
              }
            }

            return (
              <button
                key={option}
                type="button"
                disabled={answered}
                onClick={() => {
                  setPicked(option);
                  if (isCorrectOption) burstConfetti();
                }}
                className={`rounded-2xl border-2 py-3.5 px-4 text-lg font-extrabold transition-all cursor-pointer disabled:cursor-default ${classes}`}
              >
                {option}
                {answered && isCorrectOption && <span className="ml-2">✅</span>}
                {answered && isPicked && !isCorrectOption && <span className="ml-2">❌</span>}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="animate-pop-in space-y-3">
            <p
              className={`text-center font-extrabold ${
                correct ? "text-palm-deep" : "text-coral-deep"
              }`}
            >
              {correct
                ? pickMessage(PRAISE, word.id)
                : pickMessage(ENCOURAGE, word.id)}
            </p>
            {!correct && (
              <p className="text-center text-sm font-semibold text-ink-soft">
                “{word.english_word}” is <strong>{word.konkani_word}</strong>
                {word.pronunciation ? ` — ${word.pronunciation}` : ""}
              </p>
            )}
            <button
              type="button"
              onClick={() => onContinue(correct)}
              className={`btn-chunky w-full text-white text-lg font-extrabold py-4 px-6 shadow-lg cursor-pointer ${
                correct ? "bg-palm border-palm-deep" : "bg-sea border-sea-deep"
              }`}
            >
              {correct ? "Continue → (+10 XP)" : "Got it — continue →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
