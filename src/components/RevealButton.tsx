"use client";

interface RevealButtonProps {
  onReveal: () => void;
  label?: string;
}

/** Big friendly button that flips the lesson card to its Konkani side. */
export function RevealButton({ onReveal, label = "Reveal Konkani" }: RevealButtonProps) {
  return (
    <button
      type="button"
      onClick={onReveal}
      className="btn-chunky w-full bg-sea border-sea-deep text-white text-lg font-extrabold py-4 px-6 shadow-lg cursor-pointer"
    >
      <span aria-hidden className="mr-2">🥥</span>
      {label}
    </button>
  );
}
