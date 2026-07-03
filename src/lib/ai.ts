import type { AIHints, AISuggestions } from "./types";

/**
 * Mock AI helper for the admin dashboard.
 *
 * This module fabricates plausible, playful suggestions from templates so
 * the whole admin flow works without any API key. To plug in a real LLM,
 * replace `generateSuggestions` inside src/app/api/ai/suggest/route.ts —
 * the request/response shape can stay exactly the same. See README.md
 * ("Connecting real AI") for a drop-in OpenAI example.
 */

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

/** Cheap deterministic hash so the same word pair gets stable suggestions. */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Guess an English word that the Konkani word "sounds like". */
function guessSoundsLike(konkani: string): string {
  const k = konkani.toLowerCase().trim();
  const knownPairs: Record<string, string> = {
    naak: "knock",
    udok: "you dock",
    ghor: "gore-geous",
    mog: "mug",
    naral: "natural",
    suryo: "sir-yo",
    avoy: "ahoy",
    chondrim: "charmed him",
    nishtem: "nice system",
    sukonnem: "so content",
  };
  if (knownPairs[k]) return knownPairs[k];
  // Fallback: echo the first syllable so the mnemonic still reads naturally.
  const firstSyllable = k.match(/^[^aeiou]*[aeiou]+/)?.[0] ?? k.slice(0, 3);
  return `"${firstSyllable}..."`;
}

export function generateSuggestions(
  english: string,
  konkani: string,
  hints?: AIHints
): AISuggestions {
  const e = english.trim();
  const k = konkani.trim();
  const seed = hash(`${e.toLowerCase()}|${k.toLowerCase()}`);

  const soundsLike = hints?.soundsLike?.trim() || guessSoundsLike(k);
  const object1 = hints?.object1?.trim() || e.toLowerCase();
  const object2 = hints?.object2?.trim() || pick(
    ["a wooden door", "a coconut palm", "a fishing boat", "a beach umbrella", "a clay pot"],
    seed
  );
  const scene =
    hints?.sceneIdea?.trim() ||
    pick(
      [
        `on a sunny Goan beach`,
        `at a bustling coastal market`,
        `under a swaying palm tree`,
        `beside a bright blue fishing boat`,
        `in a cozy tiled-roof kitchen`,
      ],
      seed + 1
    );

  const mnemonics = [
    `"${k}" sounds like "${soundsLike}" — picture a ${object1} ${verbFor(seed)} ${object2}!`,
    `Say "${k}" out loud: hear "${soundsLike}"? Imagine ${aOrAn(object1)} ${object1} ${scene}, shouting "${k}!"`,
    `Link it: ${e} → ${k}. Think "${soundsLike}" and see ${aOrAn(object1)} ${object1} next to ${object2} — you'll never forget it.`,
  ];

  const imageIdeas = [
    `A cute cartoon ${object1} ${verbFor(seed)} ${object2}, ${scene}`,
    `${capitalize(aOrAn(object1))} ${object1} wearing sunglasses, holding a sign that says "${k}", ${scene}`,
    `A tiny parrot mascot pointing at ${aOrAn(object1)} ${object1} and ${object2}, with the word "${k}" in a speech bubble`,
  ];

  const explanation = `"${k}" is the Konkani word for "${e}". It sounds a bit like "${soundsLike}", which makes it easy to remember. Try using it in a short sentence today!`;

  return { mnemonics, imageIdeas, explanation };
}

function verbFor(seed: number): string {
  return pick(
    ["knocking on", "dancing around", "high-fiving", "balancing on", "waving at"],
    seed + 2
  );
}

function aOrAn(word: string): string {
  return /^[aeiou]/i.test(word.trim()) ? "an" : "a";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
