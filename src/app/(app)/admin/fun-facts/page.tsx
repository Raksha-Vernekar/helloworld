"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminGate } from "@/components/AdminGate";
import { useQuest } from "@/components/QuestProvider";
import { deleteFunFact, saveFunFact } from "@/lib/data";
import type { FunFact } from "@/lib/types";

export default function AdminFunFactsPage() {
  return (
    <AdminGate>
      <FunFactsManager />
    </AdminGate>
  );
}

function FunFactsManager() {
  const { funFacts, refreshContent } = useQuest();
  const [editing, setEditing] = useState<FunFact | null>(null);
  const [creating, setCreating] = useState(false);
  const [factText, setFactText] = useState("");
  const [unlockPoints, setUnlockPoints] = useState(50);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formOpen = creating || editing !== null;

  function openCreate() {
    setEditing(null);
    setCreating(true);
    setFactText("");
    const maxPoints = funFacts.reduce((m, f) => Math.max(m, f.unlock_points), 0);
    setUnlockPoints(maxPoints + 50);
  }

  function openEdit(fact: FunFact) {
    setCreating(false);
    setEditing(fact);
    setFactText(fact.fact_text);
    setUnlockPoints(fact.unlock_points);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!factText.trim()) return;
    setSaving(true);
    try {
      await saveFunFact({
        id: editing?.id,
        fact_text: factText.trim(),
        unlock_points: unlockPoints,
      });
      await refreshContent();
      setEditing(null);
      setCreating(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(fact: FunFact) {
    setDeletingId(fact.id);
    try {
      await deleteFunFact(fact.id);
      await refreshContent();
    } finally {
      setDeletingId(null);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border-2 border-sand-deep bg-white px-3 py-2.5 text-sm font-semibold text-ink focus:border-lagoon focus:outline-none";

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
          <h2 className="text-2xl font-extrabold text-sea-deep">🎁 Fun facts</h2>
        </div>
        {!formOpen && (
          <button
            type="button"
            onClick={openCreate}
            className="btn-chunky bg-palm border-palm-deep text-white font-extrabold py-2.5 px-5 cursor-pointer"
          >
            + Add fact
          </button>
        )}
      </header>

      <p className="text-sm font-semibold text-ink-soft">
        Learners unlock one fact every 50 XP. Set each fact&apos;s unlock
        threshold below.
      </p>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white border-2 border-sand-deep shadow-md p-5 space-y-4"
        >
          <h3 className="text-lg font-extrabold text-ink">
            {editing ? "Edit fun fact" : "Add a fun fact"}
          </h3>
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wide text-ink-soft">
              Fact text *
            </span>
            <textarea
              required
              rows={3}
              value={factText}
              onChange={(e) => setFactText(e.target.value)}
              placeholder="Konkani is written in five different scripts…"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wide text-ink-soft">
              Unlock points (multiples of 50 work best)
            </span>
            <input
              type="number"
              min={50}
              step={50}
              value={unlockPoints}
              onChange={(e) => setUnlockPoints(Number(e.target.value))}
              className={inputClass}
            />
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-chunky flex-1 bg-palm border-palm-deep text-white font-extrabold py-3 px-6 disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Add fact"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setCreating(false);
              }}
              className="btn-chunky flex-1 bg-white border-sand-deep text-ink-soft font-extrabold py-3 px-6 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <ul className="space-y-2">
        {funFacts.map((f) => (
          <li
            key={f.id}
            className="rounded-2xl bg-white border-2 border-sand-deep px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-mango-deep">
                  🎯 {f.unlock_points} XP
                </p>
                <p className="text-sm font-semibold text-ink">{f.fact_text}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    openEdit(f);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="rounded-xl bg-lagoon/15 text-sea-deep font-extrabold text-sm px-3 py-2 hover:bg-lagoon/30 transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(f)}
                  disabled={deletingId === f.id}
                  className="rounded-xl bg-coral/15 text-coral-deep font-extrabold text-sm px-3 py-2 hover:bg-coral/30 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {deletingId === f.id ? "…" : "Delete"}
                </button>
              </div>
            </div>
          </li>
        ))}
        {funFacts.length === 0 && (
          <p className="text-center font-semibold text-ink-soft py-8">
            No fun facts yet — add your first one! 🌱
          </p>
        )}
      </ul>
    </div>
  );
}
