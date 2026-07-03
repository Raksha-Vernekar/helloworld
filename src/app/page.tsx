import Link from "next/link";
import { Mascot } from "@/components/Mascot";

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center bg-gradient-to-b from-sand via-sand to-lagoon/15">
      <div className="animate-float">
        <Mascot size={160} />
      </div>

      <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold text-sea-deep animate-pop-in">
        Konkani Quest
      </h1>
      <p className="mt-3 max-w-md text-base sm:text-lg font-semibold text-ink-soft">
        Learn Konkani the fun way — one word, one silly picture, one
        unforgettable mnemonic at a time. 🌴🦜
      </p>

      <div className="mt-8 w-full max-w-xs space-y-3">
        <Link
          href="/learn"
          className="btn-chunky block w-full bg-palm border-palm-deep text-white text-lg font-extrabold py-4 px-6 shadow-lg"
        >
          🚀 Start learning
        </Link>
        <Link
          href="/login"
          className="btn-chunky block w-full bg-white border-sand-deep text-sea-deep text-lg font-extrabold py-4 px-6 shadow"
        >
          I have an account
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-3 gap-4 text-sm font-bold text-ink-soft">
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl animate-sparkle" aria-hidden>⚡</span>
          Earn XP
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl animate-sparkle" aria-hidden>🔥</span>
          Keep streaks
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl animate-sparkle" aria-hidden>🎁</span>
          Unlock facts
        </div>
      </div>
    </div>
  );
}
