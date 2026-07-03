"use client";

import { useState } from "react";
import Image from "next/image";
import type { Word } from "@/lib/types";
import { RevealButton } from "./RevealButton";
import { MnemonicBox } from "./MnemonicBox";

interface LessonCardProps {
  word: Word;
  onRemembered: () => void;
  onPracticeAgain: () => void;
}

/**
 * The core learning card. Front: image + English word + reveal button.
 * Back: Konkani word, pronunciation, mnemonic, image idea, and the two
 * big action buttons.
 *
 * Render with `key={word.id}` so the card resets when the word changes.
 */
export function LessonCard({ word, onRemembered, onPracticeAgain }: LessonCardProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="animate-pop-in w-full max-w-md mx-auto rounded-[2rem] bg-white shadow-xl border-2 border-sand-deep overflow-hidden">
      <div className="relative w-full aspect-[3/2] bg-sand-deep">
        <Image
          src={word.image_url || "https://placehold.co/600x400/ffefd4/1e3a3a?text=Konkani+Quest"}
          alt={word.english_word}
          fill
          sizes="(max-width: 640px) 100vw, 448px"
          className="object-cover"
          unoptimized
        />
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-sea-deep shadow">
          {word.category}
        </span>
        <span className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-coral shadow">
          {word.difficulty}
        </span>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-ink-soft">
            English
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink">
            {word.english_word}
          </h2>
        </div>

        {!revealed ? (
          <RevealButton onReveal={() => setRevealed(true)} />
        ) : (
          <div className="animate-flip-reveal space-y-4">
            <div className="rounded-2xl bg-gradient-to-br from-sea to-lagoon text-white text-center py-5 px-4 shadow-inner">
              <p className="text-xs font-extrabold uppercase tracking-widest text-white/80">
                Konkani
              </p>
              <p className="text-4xl font-extrabold">{word.konkani_word}</p>
              {word.pronunciation && (
                <p className="mt-1 text-sm font-semibold text-white/90">
                  🔊 {word.pronunciation}
                </p>
              )}
            </div>

            <MnemonicBox mnemonic={word.mnemonic} imagePrompt={word.image_prompt} />

            {word.example_sentence && (
              <div className="rounded-2xl bg-palm/10 border-2 border-palm/30 p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-palm-deep mb-1">
                  💬 Try it out
                </p>
                <p className="text-sm sm:text-base font-semibold text-ink">
                  {word.example_sentence}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={onRemembered}
                className="btn-chunky bg-palm border-palm-deep text-white text-base font-extrabold py-4 px-4 shadow-lg cursor-pointer"
              >
                ✅ I remembered it
              </button>
              <button
                type="button"
                onClick={onPracticeAgain}
                className="btn-chunky bg-coral border-coral-deep text-white text-base font-extrabold py-4 px-4 shadow-lg cursor-pointer"
              >
                🔁 Practice again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
