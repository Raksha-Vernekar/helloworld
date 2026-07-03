"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminGate } from "@/components/AdminGate";
import { AdminWordForm, type WordFormValues } from "@/components/AdminWordForm";
import { useQuest } from "@/components/QuestProvider";
import { deleteWord, saveWord } from "@/lib/data";
import type { Word } from "@/lib/types";

export default function AdminWordsPage() {
  return (
    <AdminGate>
      <WordsManager />
    </AdminGate>
  );
}

function WordsManager() {
  const { words, funFacts, refreshContent } = useQuest();
  const [editing, setEditing] = useState<Word | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formOpen = creating || editing !== null;

  async function handleSubmit(values: WordFormValues) {
    await saveWord(editing ? { ...values, id: editing.id } : values);
    await refreshContent();
    setEditing(null);
    setCreating(false);
  }

  async function handleDelete(word: Word) {
    setDeletingId(word.id);
    try {
      await deleteWord(word.id);
      await refreshContent();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5 animate-pop-in">
      <header className="flex items-center justify-between gap-3">
        <div>
          <Link
            href="/admin"
            className="text-xs font-extrabold text-sea-deep underline underline-offset-2"
          >
            ← Admin
          </Link>
          <h2 className="text-2xl font-extrabold text-sea-deep">📚 Words</h2>
        </div>
        {!formOpen && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="btn-chunky bg-palm border-palm-deep text-white font-extrabold py-2.5 px-5 cursor-pointer"
          >
            + Add word
          </button>
        )}
      </header>

      {formOpen && (
        <section className="rounded-3xl bg-white border-2 border-sand-deep shadow-md p-5">
          <h3 className="text-lg font-extrabold text-ink mb-4">
            {editing ? `Edit “${editing.english_word}”` : "Add a new word"}
          </h3>
          <AdminWordForm
            key={editing?.id ?? "new"}
            initial={editing}
            funFacts={funFacts}
            onSubmit={handleSubmit}
            onCancel={() => {
              setEditing(null);
              setCreating(false);
            }}
          />
        </section>
      )}

      <ul className="space-y-2">
        {words.map((w) => (
          <li
            key={w.id}
            className="rounded-2xl bg-white border-2 border-sand-deep px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-extrabold text-ink truncate">
                  {w.english_word}{" "}
                  <span className="text-sea-deep">→ {w.konkani_word}</span>
                </p>
                <p className="text-xs font-semibold text-ink-soft truncate">
                  {w.pronunciation || "no pronunciation"} · {w.category} ·{" "}
                  {w.difficulty}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setEditing(w);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="rounded-xl bg-lagoon/15 text-sea-deep font-extrabold text-sm px-3 py-2 hover:bg-lagoon/30 transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(w)}
                  disabled={deletingId === w.id}
                  className="rounded-xl bg-coral/15 text-coral-deep font-extrabold text-sm px-3 py-2 hover:bg-coral/30 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {deletingId === w.id ? "…" : "Delete"}
                </button>
              </div>
            </div>
          </li>
        ))}
        {words.length === 0 && (
          <p className="text-center font-semibold text-ink-soft py-8">
            No words yet — add your first one! 🌱
          </p>
        )}
      </ul>
    </div>
  );
}
