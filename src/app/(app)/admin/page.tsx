"use client";

import Link from "next/link";
import { AdminGate } from "@/components/AdminGate";
import { useQuest } from "@/components/QuestProvider";
import { isSupabaseConfigured } from "@/lib/data";

export default function AdminDashboardPage() {
  return (
    <AdminGate>
      <AdminDashboard />
    </AdminGate>
  );
}

function AdminDashboard() {
  const { words, funFacts } = useQuest();

  return (
    <div className="space-y-6 animate-pop-in">
      <header>
        <h2 className="text-2xl font-extrabold text-sea-deep">🛠️ Admin dashboard</h2>
        <p className="text-sm font-semibold text-ink-soft">
          Manage the words and fun facts that power Konkani Quest.
        </p>
      </header>

      {!isSupabaseConfigured && (
        <div className="rounded-2xl bg-mango/15 border-2 border-mango/40 p-4 text-sm font-semibold text-ink">
          🏝️ <strong>Demo mode:</strong> edits are saved in your browser&apos;s
          localStorage. Connect Supabase (see README) to store them in a real
          database with admin-only access.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-3xl bg-white border-2 border-sand-deep shadow-md p-5 text-center">
          <p className="text-4xl" aria-hidden>📚</p>
          <p className="text-3xl font-extrabold text-ink">{words.length}</p>
          <p className="text-xs font-bold text-ink-soft uppercase tracking-wide">Words</p>
        </div>
        <div className="rounded-3xl bg-white border-2 border-sand-deep shadow-md p-5 text-center">
          <p className="text-4xl" aria-hidden>🎁</p>
          <p className="text-3xl font-extrabold text-ink">{funFacts.length}</p>
          <p className="text-xs font-bold text-ink-soft uppercase tracking-wide">
            Fun facts
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Link
          href="/admin/words"
          className="btn-chunky block w-full bg-sea border-sea-deep text-white text-lg font-extrabold py-4 px-6 text-center"
        >
          📚 Manage words
        </Link>
        <Link
          href="/admin/fun-facts"
          className="btn-chunky block w-full bg-mango border-mango-deep text-ink text-lg font-extrabold py-4 px-6 text-center"
        >
          🎁 Manage fun facts
        </Link>
      </div>
    </div>
  );
}
