"use client";

import { FUN_FACT_INTERVAL } from "@/lib/types";

interface PointsBarProps {
  points: number;
  streak: number;
}

/**
 * XP header: total points, current streak, and a progress bar showing
 * how close the learner is to the next 50-point fun-fact unlock.
 */
export function PointsBar({ points, streak }: PointsBarProps) {
  const intoMilestone = points % FUN_FACT_INTERVAL;
  const pct = (intoMilestone / FUN_FACT_INTERVAL) * 100;
  const toNext = FUN_FACT_INTERVAL - intoMilestone;

  return (
    <div className="w-full rounded-3xl bg-white shadow-md border-2 border-sand-deep px-4 py-3 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 font-extrabold text-mango-deep">
          <span aria-hidden className="text-xl">⚡</span>
          <span className="text-lg">{points}</span>
          <span className="text-xs font-bold text-ink-soft uppercase tracking-wide">XP</span>
        </div>
        <div className="flex items-center gap-1.5 font-extrabold text-coral">
          <span aria-hidden className="text-xl">🔥</span>
          <span className="text-lg">{streak}</span>
          <span className="text-xs font-bold text-ink-soft uppercase tracking-wide">
            day{streak === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="mt-2">
        <div
          className="h-4 w-full rounded-full bg-sand-deep overflow-hidden"
          role="progressbar"
          aria-valuenow={intoMilestone}
          aria-valuemin={0}
          aria-valuemax={FUN_FACT_INTERVAL}
          aria-label="Progress to next fun fact"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-lagoon to-sea transition-all duration-700 ease-out"
            style={{ width: `${Math.max(pct, 4)}%` }}
          />
        </div>
        <p className="mt-1 text-xs font-semibold text-ink-soft">
          {toNext === FUN_FACT_INTERVAL
            ? "Fresh milestone — go get it!"
            : `${toNext} XP to your next fun fact 🎁`}
        </p>
      </div>
    </div>
  );
}
