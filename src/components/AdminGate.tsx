"use client";

import Link from "next/link";
import { Mascot } from "./Mascot";
import { useQuest } from "./QuestProvider";

/**
 * Wraps admin pages. In demo mode everyone may explore the dashboard;
 * with Supabase connected, only profiles with is_admin = true get in.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const { loading, profile } = useQuest();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Mascot size={90} className="animate-wiggle" />
        <p className="font-extrabold text-ink-soft">Checking your captain&apos;s hat…</p>
      </div>
    );
  }

  if (!profile || !profile.is_admin) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <Mascot size={110} />
        <h2 className="text-2xl font-extrabold text-sea-deep">Admins only! 🛟</h2>
        <p className="max-w-sm font-semibold text-ink-soft">
          {profile
            ? "Your account doesn't have admin access. Ask an existing admin to flip is_admin on your profile."
            : "Sign in with an admin account to manage words and fun facts."}
        </p>
        <Link
          href={profile ? "/learn" : "/login"}
          className="btn-chunky bg-sea border-sea-deep text-white font-extrabold py-3 px-6"
        >
          {profile ? "Back to learning" : "Go to login"}
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
