import type { AIHints, MnemonicSuggestions } from "./types";

/**
 * AI suggestion service for Konkani Quest.
 *
 * Public entry point: `generateMnemonicSuggestions(englishWord, konkaniWord)`.
 * It returns:
 *   {
 *     "mnemonics": [3 mnemonic ideas],
 *     "imagePrompts": [3 visual image prompts],
 *     "pronunciationTip": "1 beginner-friendly tip"
 *   }
 *
 * The service is provider-based:
 *   - `mockProvider` fabricates playful suggestions from templates and is
 *     always available (no API key needed).
 *   - `openAIProvider` calls the OpenAI Chat Completions API and is used
 *     automatically when OPENAI_API_KEY is set (server-side only). If the
 *     API call fails, it falls back to the mock so admins are never stuck.
 *
 * To add another provider (Anthropic, Gemini, a local model, …) implement
 * `SuggestionProvider` and swap it in `pickProvider()`.
 */

interface SuggestionProvider {
  generate(
    englishWord: string,
    konkaniWord: string,
    hints?: AIHints
  ): Promise<MnemonicSuggestions>;
}

// ---------------------------------------------------------------
// Mock provider (templates, deterministic per word pair)
// ---------------------------------------------------------------

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
  const firstSyllable = k.match(/^[^aeiou]*[aeiou]+/)?.[0] ?? k.slice(0, 3);
  return `"${firstSyllable}..."`;
}

/** Naive syllable split for the pronunciation tip, e.g. "naral" → NA-RAL. */
function syllablesOf(word: string): string[] {
  const clean = word.trim().toLowerCase().replace(/[^a-z]/g, "");
  const parts = clean.match(/[^aeiou]*[aeiou]+(?:[^aeiou](?![aeiou]))?/g);
  return parts && parts.length > 0 ? parts : [clean];
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

const mockProvider: SuggestionProvider = {
  async generate(englishWord, konkaniWord, hints) {
    const e = englishWord.trim();
    const k = konkaniWord.trim();
    const seed = hash(`${e.toLowerCase()}|${k.toLowerCase()}`);

    const soundsLike = hints?.soundsLike?.trim() || guessSoundsLike(k);
    const object1 = hints?.object1?.trim() || e.toLowerCase();
    const object2 =
      hints?.object2?.trim() ||
      pick(
        ["a wooden door", "a coconut palm", "a fishing boat", "a beach umbrella", "a clay pot"],
        seed
      );
    const scene =
      hints?.sceneIdea?.trim() ||
      pick(
        [
          "on a sunny Goan beach",
          "at a bustling coastal market",
          "under a swaying palm tree",
          "beside a bright blue fishing boat",
          "in a cozy tiled-roof kitchen",
        ],
        seed + 1
      );

    const mnemonics = [
      `"${k}" sounds like "${soundsLike}" — picture a ${object1} ${verbFor(seed)} ${object2}!`,
      `Say "${k}" out loud: hear "${soundsLike}"? Imagine ${aOrAn(object1)} ${object1} ${scene}, shouting "${k}!"`,
      `Link it: ${e} → ${k}. Think "${soundsLike}" and see ${aOrAn(object1)} ${object1} next to ${object2} — you'll never forget it.`,
    ];

    const imagePrompts = [
      `A cute cartoon ${object1} ${verbFor(seed)} ${object2}, ${scene}`,
      `${capitalize(aOrAn(object1))} ${object1} wearing sunglasses, holding a sign that says "${k}", ${scene}`,
      `A tiny parrot mascot pointing at ${aOrAn(object1)} ${object1} and ${object2}, with the word "${k}" in a speech bubble`,
    ];

    const beats = syllablesOf(k);
    const pronunciationTip = `Break it into ${beats.length} beat${beats.length === 1 ? "" : "s"}: ${beats
      .map((b) => b.toUpperCase())
      .join("-")}. It sounds a bit like "${soundsLike}" — say it slowly twice, then at normal speed.`;

    return { mnemonics, imagePrompts, pronunciationTip };
  },
};

// ---------------------------------------------------------------
// OpenAI provider (used automatically when OPENAI_API_KEY is set)
// ---------------------------------------------------------------

const openAIProvider: SuggestionProvider = {
  async generate(englishWord, konkaniWord, hints) {
    const hintText = hints
      ? `\nAdmin hints — sounds like: ${hints.soundsLike ?? "-"}, object 1: ${
          hints.object1 ?? "-"
        }, object 2: ${hints.object2 ?? "-"}, scene idea: ${hints.sceneIdea ?? "-"}`
      : "";

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You create playful memory aids for English speakers learning Konkani. " +
              'Reply with JSON exactly in this shape: {"mnemonics": [3 short mnemonic ideas], ' +
              '"imagePrompts": [3 funny, vivid image-generation prompts], ' +
              '"pronunciationTip": "one beginner-friendly pronunciation tip"}.',
          },
          {
            role: "user",
            content: `English: ${englishWord}\nKonkani: ${konkaniWord}${hintText}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI request failed with status ${res.status}`);
    }

    const data = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return {
      mnemonics: (parsed.mnemonics ?? []).slice(0, 3).map(String),
      imagePrompts: (parsed.imagePrompts ?? []).slice(0, 3).map(String),
      pronunciationTip: String(parsed.pronunciationTip ?? ""),
    };
  },
};

// ---------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------

function pickProvider(): SuggestionProvider {
  return process.env.OPENAI_API_KEY ? openAIProvider : mockProvider;
}

export async function generateMnemonicSuggestions(
  englishWord: string,
  konkaniWord: string,
  hints?: AIHints
): Promise<MnemonicSuggestions> {
  const provider = pickProvider();
  try {
    return await provider.generate(englishWord, konkaniWord, hints);
  } catch (error) {
    // Never leave the admin empty-handed: fall back to the local mock.
    console.warn("AI provider failed, falling back to mock:", error);
    return mockProvider.generate(englishWord, konkaniWord, hints);
  }
}
