"use client";

import { useState } from "react";
import {
  CATEGORIES,
  DIFFICULTIES,
  type Difficulty,
  type FunFact,
  type Word,
} from "@/lib/types";
import { AISuggestionBox } from "./AISuggestionBox";

export interface WordFormValues {
  english_word: string;
  konkani_word: string;
  pronunciation: string;
  category: string;
  difficulty: Difficulty;
  example_sentence: string;
  image_prompt: string;
  image_url: string;
  mnemonic: string;
  fun_fact_trigger: string | null;
}

interface AdminWordFormProps {
  initial?: Word | null;
  funFacts: FunFact[];
  onSubmit: (values: WordFormValues) => Promise<void>;
  onCancel: () => void;
}

const EMPTY: WordFormValues = {
  english_word: "",
  konkani_word: "",
  pronunciation: "",
  category: "general",
  difficulty: "beginner",
  example_sentence: "",
  image_prompt: "",
  image_url: "",
  mnemonic: "",
  fun_fact_trigger: null,
};

/** Admin form for creating/editing words, with the AI helper embedded. */
export function AdminWordForm({ initial, funFacts, onSubmit, onCancel }: AdminWordFormProps) {
  const [values, setValues] = useState<WordFormValues>(
    initial
      ? {
          english_word: initial.english_word,
          konkani_word: initial.konkani_word,
          pronunciation: initial.pronunciation,
          category: initial.category,
          difficulty: initial.difficulty,
          example_sentence: initial.example_sentence,
          image_prompt: initial.image_prompt,
          image_url: initial.image_url,
          mnemonic: initial.mnemonic,
          fun_fact_trigger: initial.fun_fact_trigger ?? null,
        }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof WordFormValues>(key: K, value: WordFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.english_word.trim() || !values.konkani_word.trim()) {
      setError("English and Konkani words are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save word");
      setSaving(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border-2 border-sand-deep bg-white px-3 py-2.5 text-sm font-semibold text-ink focus:border-lagoon focus:outline-none";
  const labelClass = "text-xs font-extrabold uppercase tracking-wide text-ink-soft";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className={labelClass}>English word *</span>
          <input
            type="text"
            required
            value={values.english_word}
            onChange={(e) => set("english_word", e.target.value)}
            placeholder="Nose"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Konkani word *</span>
          <input
            type="text"
            required
            value={values.konkani_word}
            onChange={(e) => set("konkani_word", e.target.value)}
            placeholder="Naak"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Pronunciation</span>
          <input
            type="text"
            value={values.pronunciation}
            onChange={(e) => set("pronunciation", e.target.value)}
            placeholder='naak (rhymes with "clock")'
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Category</span>
          <select
            value={values.category}
            onChange={(e) => set("category", e.target.value)}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Difficulty</span>
          <select
            value={values.difficulty}
            onChange={(e) => set("difficulty", e.target.value as Difficulty)}
            className={inputClass}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Fun fact trigger (optional)</span>
          <select
            value={values.fun_fact_trigger ?? ""}
            onChange={(e) => set("fun_fact_trigger", e.target.value || null)}
            className={inputClass}
          >
            <option value="">— none —</option>
            {funFacts.map((f) => (
              <option key={f.id} value={f.id}>
                {f.unlock_points} XP — {f.fact_text.slice(0, 50)}…
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>Example sentence</span>
        <input
          type="text"
          value={values.example_sentence}
          onChange={(e) => set("example_sentence", e.target.value)}
          placeholder="Mhaji naak lamb asa. (My nose is long.)"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Mnemonic</span>
        <textarea
          value={values.mnemonic}
          onChange={(e) => set("mnemonic", e.target.value)}
          placeholder='"Naak" sounds like "knock" — imagine a nose knocking on a door!'
          rows={2}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Image prompt</span>
        <textarea
          value={values.image_prompt}
          onChange={(e) => set("image_prompt", e.target.value)}
          placeholder="A cute cartoon nose knocking on a wooden door"
          rows={2}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Image URL (placeholder for now)</span>
        <input
          type="url"
          value={values.image_url}
          onChange={(e) => set("image_url", e.target.value)}
          placeholder="https://placehold.co/600x400"
          className={inputClass}
        />
      </label>

      <AISuggestionBox
        english={values.english_word}
        konkani={values.konkani_word}
        onUseMnemonic={(m) => set("mnemonic", m)}
        onUseImageIdea={(idea) => set("image_prompt", idea)}
      />

      {error && <p className="text-sm font-bold text-coral-deep">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={saving}
          className="btn-chunky flex-1 bg-palm border-palm-deep text-white text-base font-extrabold py-3.5 px-6 disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving…" : initial ? "Save changes" : "Add word"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-chunky flex-1 bg-white border-sand-deep text-ink-soft text-base font-extrabold py-3.5 px-6 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
