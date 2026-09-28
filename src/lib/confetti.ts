"use client";

import confetti from "canvas-confetti";

const TROPICAL_COLORS = ["#0891b2", "#06b6d4", "#ff6f61", "#ffb020", "#16a34a", "#fff8ec"];

/** Small burst — used when a word is completed. */
export function burstConfetti() {
  confetti({
    particleCount: 45,
    spread: 65,
    origin: { y: 0.7 },
    colors: TROPICAL_COLORS,
    scalar: 0.9,
  });
}

/** Big double-sided celebration — used on every 50-point milestone. */
export function celebrateConfetti() {
  const defaults = { colors: TROPICAL_COLORS, ticks: 220 };
  confetti({ ...defaults, particleCount: 90, spread: 100, origin: { x: 0.2, y: 0.6 } });
  confetti({ ...defaults, particleCount: 90, spread: 100, origin: { x: 0.8, y: 0.6 } });
  setTimeout(() => {
    confetti({ ...defaults, particleCount: 60, spread: 120, origin: { x: 0.5, y: 0.4 } });
  }, 250);
}
