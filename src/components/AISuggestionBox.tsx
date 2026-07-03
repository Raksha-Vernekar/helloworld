"use client";

import { useState } from "react";
import type { AIHints, AISuggestions } from "@/lib/types";

interface AISuggestionBoxProps {
  english: string;
  konkani: string;
  onUseMnemonic: (mnemonic: string) => void;
  onUseImageIdea: (imagePrompt: string) => void;
}

/**
 * Admin AI helper. Generates 3 mnemonics, 3 funny image ideas, and a
 * beginner explanation from the English + Konkani pair. If the admin
 * dislikes the suggestions, they can supply hints (sounds-like word,
 * two objects, a scene idea) and regenerate.
 */
export function AISuggestionBox({
  english,
  konkani,
  onUseMnemonic,
  onUseImageIdea,
}: AISuggestionBoxProps) {
  const [suggestions, setSuggestions] = useState<AISuggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [hints, setHints] = useState<AIHints>({});

  const canGenerate = english.trim().length > 0 && konkani.trim().length > 0;

  async function generate(withHints: boolean) {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          english,
          konkani,
          hints: withHints ? hints : undefined,
        }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setSuggestions((await res.json()) as AISuggestions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const hintField = (
    label: string,
    key: keyof AIHints,
    placeholder: string
  ) => (
    <label className="block">
      <span className="text-xs font-extrabold uppercase tracking-wide text-ink-soft">
        {label}
      </span>
      <input
        type="text"
        value={hints[key] ?? ""}
        onChange={(e) => setHints((h) => ({ ...h, [key]: e.target.value }))}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border-2 border-sand-deep bg-white px-3 py-2 text-sm font-semibold focus:border-lagoon focus:outline-none"
      />
    </label>
  );

  return (
    <div className="rounded-3xl border-2 border-lagoon/40 bg-lagoon/5 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-extrabold text-sea-deep">
          ✨ AI helper
        </h3>
        <button
          type="button"
          onClick={() => generate(false)}
          disabled={!canGenerate || loading}
          className="btn-chunky bg-sea border-sea-deep text-white text-sm font-extrabold py-2 px-4 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Thinking…" : suggestions ? "Regenerate" : "Generate ideas"}
        </button>
      </div>

      {!canGenerate && (
        <p className="mt-2 text-sm font-semibold text-ink-soft">
          Enter both the English and Konkani words above, then hit “Generate
          ideas”.
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm font-bold text-coral-deep">{error}</p>
      )}

      {suggestions && (
        <div className="mt-4 space-y-4 animate-pop-in">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-mango-deep mb-1.5">
              🧠 Mnemonic suggestions — tap to use
            </p>
            <ul className="space-y-2">
              {suggestions.mnemonics.map((m, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => onUseMnemonic(m)}
                    className="w-full text-left rounded-xl border-2 border-mango/40 bg-mango/10 hover:bg-mango/25 px-3 py-2 text-sm font-semibold text-ink transition-colors cursor-pointer"
                  >
                    {m}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-sea-deep mb-1.5">
              🎨 Funny image ideas — tap to use
            </p>
            <ul className="space-y-2">
              {suggestions.imageIdeas.map((idea, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => onUseImageIdea(idea)}
                    className="w-full text-left rounded-xl border-2 border-lagoon/40 bg-lagoon/10 hover:bg-lagoon/25 px-3 py-2 text-sm font-semibold text-ink transition-colors cursor-pointer"
                  >
                    {idea}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-palm/10 border-2 border-palm/30 px-3 py-2">
            <p className="text-xs font-extrabold uppercase tracking-wider text-palm-deep mb-1">
              📖 Beginner explanation
            </p>
            <p className="text-sm font-semibold text-ink">
              {suggestions.explanation}
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowHints((s) => !s)}
              className="text-sm font-extrabold text-coral-deep underline underline-offset-2 cursor-pointer"
            >
              {showHints ? "Hide hints" : "Don’t like these? Give the AI hints"}
            </button>

            {showHints && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl bg-white border-2 border-sand-deep p-4">
                {hintField("Sounds like word", "soundsLike", 'e.g. "knock"')}
                {hintField("Object 1", "object1", "e.g. nose")}
                {hintField("Object 2", "object2", "e.g. wooden door")}
                {hintField("Scene idea", "sceneIdea", "e.g. on a Goan beach at sunset")}
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => generate(true)}
                    disabled={loading}
                    className="btn-chunky w-full bg-coral border-coral-deep text-white text-sm font-extrabold py-2.5 px-4 disabled:opacity-40 cursor-pointer"
                  >
                    {loading ? "Thinking…" : "Regenerate with my hints"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
