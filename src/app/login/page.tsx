"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mascot } from "@/components/Mascot";
import {
  isSupabaseConfigured,
  signInWithPassword,
  signUpWithPassword,
} from "@/lib/data";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signin") {
        await signInWithPassword(email, password);
        router.push("/learn");
      } else {
        await signUpWithPassword(name, email, password);
        setNotice(
          "Account created! Check your email to confirm, then sign in."
        );
        setMode("signin");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border-2 border-sand-deep bg-white px-3 py-3 text-base font-semibold text-ink focus:border-lagoon focus:outline-none";
  const labelClass = "text-xs font-extrabold uppercase tracking-wide text-ink-soft";

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-gradient-to-b from-sand to-lagoon/15">
      <Link href="/" aria-label="Back to home">
        <Mascot size={100} className="animate-float" />
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold text-sea-deep">
        {mode === "signin" ? "Welcome back!" : "Join the quest!"}
      </h1>
      <p className="mt-1 text-sm font-semibold text-ink-soft">
        {mode === "signin"
          ? "Your streak missed you. 🔥"
          : "Points, streaks, and coconut-fueled fun await. 🥥"}
      </p>

      <div className="mt-6 w-full max-w-sm rounded-3xl bg-white border-2 border-sand-deep shadow-xl p-6">
        {isSupabaseConfigured ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <label className="block">
                <span className={labelClass}>Name</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ria"
                  className={inputClass}
                />
              </label>
            )}
            <label className="block">
              <span className={labelClass}>Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Password</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </label>

            {error && <p className="text-sm font-bold text-coral-deep">{error}</p>}
            {notice && <p className="text-sm font-bold text-palm-deep">{notice}</p>}

            <button
              type="submit"
              disabled={busy}
              className="btn-chunky w-full bg-sea border-sea-deep text-white text-lg font-extrabold py-3.5 px-6 disabled:opacity-50 cursor-pointer"
            >
              {busy ? "One sec…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
              }}
              className="w-full text-center text-sm font-extrabold text-sea-deep underline underline-offset-2 cursor-pointer"
            >
              {mode === "signin"
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-sm font-semibold text-ink">
              🏝️ <strong>Demo mode</strong> — Supabase isn&apos;t connected yet, so
              your progress is saved right here in your browser.
            </p>
            <Link
              href="/learn"
              className="btn-chunky block w-full bg-palm border-palm-deep text-white text-lg font-extrabold py-3.5 px-6"
            >
              Continue as guest 🚀
            </Link>
            <p className="text-xs font-semibold text-ink-soft">
              To enable real accounts, add your Supabase keys to{" "}
              <code className="bg-sand-deep rounded px-1">.env.local</code> — see the
              README.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
