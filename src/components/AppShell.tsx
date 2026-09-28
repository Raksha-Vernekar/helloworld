"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mascot } from "./Mascot";
import { PointsBar } from "./PointsBar";
import { FunFactModal } from "./FunFactModal";
import { useQuest } from "./QuestProvider";

const NAV_ITEMS = [
  { href: "/learn", label: "Learn", emoji: "🌴" },
  { href: "/practice", label: "Practice", emoji: "🔁" },
  { href: "/progress", label: "Progress", emoji: "📈" },
  { href: "/admin", label: "Admin", emoji: "🛠️" },
];

/**
 * Learner-facing layout: sticky header with mascot + XP bar,
 * content area, and a thumb-friendly bottom navigation.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, celebrationFact, dismissCelebration } = useQuest();

  return (
    <div className="flex flex-col min-h-screen w-full max-w-2xl mx-auto">
      <header className="sticky top-0 z-40 bg-sand/95 backdrop-blur px-4 pt-3 pb-2 space-y-2">
        <div className="flex items-center gap-2">
          <Link href="/" aria-label="Konkani Quest home">
            <Mascot size={44} className="animate-float" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold text-sea-deep leading-tight truncate">
              Konkani Quest
            </h1>
            {profile && (
              <p className="text-xs font-bold text-ink-soft truncate">
                Dev borem korum, {profile.name}! 👋
              </p>
            )}
          </div>
        </div>
        {profile && <PointsBar points={profile.points} streak={profile.streak} />}
      </header>

      <main className="flex-1 px-4 pb-28 pt-3">{children}</main>

      <nav
        className="fixed bottom-0 inset-x-0 z-40 bg-white border-t-2 border-sand-deep shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
        aria-label="Main navigation"
      >
        <div className="max-w-2xl mx-auto grid grid-cols-4">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname.startsWith("/admin")
                : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-extrabold transition-colors ${
                  active ? "text-sea-deep" : "text-ink-soft hover:text-sea"
                }`}
              >
                <span
                  className={`text-2xl leading-none ${active ? "animate-wiggle" : ""}`}
                  aria-hidden
                >
                  {item.emoji}
                </span>
                {item.label}
                <span
                  className={`h-1 w-8 rounded-full ${active ? "bg-lagoon" : "bg-transparent"}`}
                />
              </Link>
            );
          })}
        </div>
      </nav>

      {celebrationFact && (
        <FunFactModal fact={celebrationFact} onClose={dismissCelebration} />
      )}
    </div>
  );
}
