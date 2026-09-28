"use client";

import { useEffect } from "react";
import type { FunFact } from "@/lib/types";
import { Mascot } from "./Mascot";
import { celebrateConfetti } from "@/lib/confetti";

interface FunFactModalProps {
  fact: FunFact;
  onClose: () => void;
}

/** Celebration modal shown when a 50-point milestone unlocks a fun fact. */
export function FunFactModal({ fact, onClose }: FunFactModalProps) {
  useEffect(() => {
    celebrateConfetti();
  }, [fact.id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Fun fact unlocked"
      onClick={onClose}
    >
      <div
        className="animate-pop-in w-full max-w-sm rounded-[2rem] bg-white shadow-2xl border-4 border-mango p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center -mt-14 mb-2">
          <div className="rounded-full bg-sand border-4 border-mango p-2 shadow-lg">
            <Mascot size={72} className="animate-wiggle" />
          </div>
        </div>

        <p className="text-xs font-extrabold uppercase tracking-widest text-mango-deep">
          🎉 Fun fact unlocked!
        </p>
        <h3 className="mt-1 text-2xl font-extrabold text-ink">
          {fact.unlock_points} XP milestone
        </h3>

        <div className="mt-4 rounded-2xl bg-sand p-4 text-left">
          <p className="text-sm sm:text-base font-semibold text-ink leading-relaxed">
            {fact.fact_text}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn-chunky mt-5 w-full bg-mango border-mango-deep text-ink text-lg font-extrabold py-3.5 px-6 shadow-lg cursor-pointer"
        >
          Borem! (Nice!) 🌴
        </button>
      </div>
    </div>
  );
}
