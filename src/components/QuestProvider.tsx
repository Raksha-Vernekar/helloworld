"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchFunFacts,
  fetchProfile,
  fetchProgress,
  fetchWords,
  updateProfile,
  upsertProgress,
} from "@/lib/data";
import {
  FUN_FACT_INTERVAL,
  POINTS_PER_WORD,
  type FunFact,
  type ProgressEntry,
  type UserProfile,
  type Word,
  type WordStatus,
} from "@/lib/types";

interface QuestContextValue {
  loading: boolean;
  profile: UserProfile | null;
  words: Word[];
  funFacts: FunFact[];
  progress: ProgressEntry[];
  unlockedFacts: FunFact[];
  /** Fact that was just unlocked by the latest completion (for the modal). */
  celebrationFact: FunFact | null;
  dismissCelebration: () => void;
  /** Marks a word completed/practiced; optionally awards XP + streak. */
  completeWord: (
    wordId: string,
    status: WordStatus,
    awardPoints?: boolean
  ) => Promise<void>;
  refreshContent: () => Promise<void>;
}

const QuestContext = createContext<QuestContextValue | null>(null);

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function QuestProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [funFacts, setFunFacts] = useState<FunFact[]>([]);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [celebrationFact, setCelebrationFact] = useState<FunFact | null>(null);

  const refreshContent = useCallback(async () => {
    const [w, f] = await Promise.all([fetchWords(), fetchFunFacts()]);
    setWords(w);
    setFunFacts(f);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [p, w, f, pr] = await Promise.all([
          fetchProfile(),
          fetchWords(),
          fetchFunFacts(),
          fetchProgress(),
        ]);
        if (cancelled) return;

        // A missed day breaks the streak.
        if (
          p &&
          p.streak > 0 &&
          p.last_active_date &&
          p.last_active_date !== todayStr() &&
          p.last_active_date !== yesterdayStr()
        ) {
          const reset = await updateProfile({ streak: 0 });
          setProfile(reset);
        } else {
          setProfile(p);
        }
        setWords(w);
        setFunFacts(f);
        setProgress(pr);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const completeWord = useCallback(
    async (wordId: string, status: WordStatus, awardPoints = true) => {
      const entry = await upsertProgress(wordId, status);
      setProgress((prev) => {
        const rest = prev.filter((e) => e.word_id !== wordId);
        return [...rest, entry];
      });

      if (!profile || !awardPoints) return;

      const newPoints = profile.points + POINTS_PER_WORD;
      const isFirstActivityToday = profile.last_active_date !== todayStr();
      const newStreak = isFirstActivityToday ? profile.streak + 1 : profile.streak;

      const updated = await updateProfile({
        points: newPoints,
        streak: newStreak,
        last_active_date: todayStr(),
      });
      setProfile(updated);

      // Crossing a 50-point boundary unlocks the next fun fact.
      const prevMilestone = Math.floor(profile.points / FUN_FACT_INTERVAL);
      const newMilestone = Math.floor(newPoints / FUN_FACT_INTERVAL);
      if (newMilestone > prevMilestone) {
        const justUnlocked = funFacts
          .filter(
            (f) =>
              f.unlock_points > profile.points && f.unlock_points <= newPoints
          )
          .sort((a, b) => a.unlock_points - b.unlock_points)[0];
        setCelebrationFact(
          justUnlocked ?? {
            id: "milestone",
            fact_text: `You reached ${newPoints} XP! Keep going — more Konkani awaits.`,
            unlock_points: newMilestone * FUN_FACT_INTERVAL,
            created_at: new Date().toISOString(),
          }
        );
      }
    },
    [profile, funFacts]
  );

  const unlockedFacts = useMemo(
    () =>
      funFacts.filter((f) => (profile ? f.unlock_points <= profile.points : false)),
    [funFacts, profile]
  );

  const value: QuestContextValue = {
    loading,
    profile,
    words,
    funFacts,
    progress,
    unlockedFacts,
    celebrationFact,
    dismissCelebration: () => setCelebrationFact(null),
    completeWord,
    refreshContent,
  };

  return <QuestContext.Provider value={value}>{children}</QuestContext.Provider>;
}

export function useQuest(): QuestContextValue {
  const ctx = useContext(QuestContext);
  if (!ctx) throw new Error("useQuest must be used inside <QuestProvider>");
  return ctx;
}
