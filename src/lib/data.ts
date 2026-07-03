"use client";

import { getSupabaseClient, isSupabaseConfigured } from "./supabase/client";
import { MOCK_FUN_FACTS, MOCK_WORDS } from "./mockData";
import type {
  FunFact,
  ProgressEntry,
  UserProfile,
  Word,
  WordStatus,
} from "./types";

/**
 * Data layer for Konkani Quest.
 *
 * When NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are set,
 * everything is read from and written to Supabase.
 *
 * Otherwise the app runs in "demo mode": words and fun facts come from
 * mock seed data, and all user state (points, streak, progress, admin
 * edits) persists in localStorage. This lets you try the whole app —
 * including the admin dashboard — before connecting a database.
 */

const LS_KEYS = {
  words: "kq_words",
  funFacts: "kq_fun_facts",
  profile: "kq_profile",
  progress: "kq_progress",
} as const;

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function localId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export { isSupabaseConfigured };

// ---------------------------------------------------------------
// Words
// ---------------------------------------------------------------

export async function fetchWords(): Promise<Word[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("words")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data as Word[];
  }
  return readLS<Word[]>(LS_KEYS.words, MOCK_WORDS);
}

export async function saveWord(
  word: Omit<Word, "id" | "created_at"> & { id?: string }
): Promise<Word> {
  const supabase = getSupabaseClient();
  if (supabase) {
    if (word.id) {
      const { id, ...fields } = word;
      const { data, error } = await supabase
        .from("words")
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Word;
    }
    const { data, error } = await supabase
      .from("words")
      .insert(word)
      .select()
      .single();
    if (error) throw error;
    return data as Word;
  }

  const words = readLS<Word[]>(LS_KEYS.words, MOCK_WORDS);
  if (word.id) {
    const updated = words.map((w) =>
      w.id === word.id ? { ...w, ...word } : w
    ) as Word[];
    writeLS(LS_KEYS.words, updated);
    return updated.find((w) => w.id === word.id)!;
  }
  const created: Word = {
    ...word,
    id: localId("w"),
    created_at: new Date().toISOString(),
  } as Word;
  writeLS(LS_KEYS.words, [...words, created]);
  return created;
}

export async function deleteWord(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("words").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const words = readLS<Word[]>(LS_KEYS.words, MOCK_WORDS);
  writeLS(
    LS_KEYS.words,
    words.filter((w) => w.id !== id)
  );
}

// ---------------------------------------------------------------
// Fun facts
// ---------------------------------------------------------------

export async function fetchFunFacts(): Promise<FunFact[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("fun_facts")
      .select("*")
      .order("unlock_points", { ascending: true });
    if (error) throw error;
    return data as FunFact[];
  }
  const facts = readLS<FunFact[]>(LS_KEYS.funFacts, MOCK_FUN_FACTS);
  return [...facts].sort((a, b) => a.unlock_points - b.unlock_points);
}

export async function saveFunFact(
  fact: Omit<FunFact, "id" | "created_at"> & { id?: string }
): Promise<FunFact> {
  const supabase = getSupabaseClient();
  if (supabase) {
    if (fact.id) {
      const { id, ...fields } = fact;
      const { data, error } = await supabase
        .from("fun_facts")
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as FunFact;
    }
    const { data, error } = await supabase
      .from("fun_facts")
      .insert(fact)
      .select()
      .single();
    if (error) throw error;
    return data as FunFact;
  }

  const facts = readLS<FunFact[]>(LS_KEYS.funFacts, MOCK_FUN_FACTS);
  if (fact.id) {
    const updated = facts.map((f) =>
      f.id === fact.id ? { ...f, ...fact } : f
    ) as FunFact[];
    writeLS(LS_KEYS.funFacts, updated);
    return updated.find((f) => f.id === fact.id)!;
  }
  const created: FunFact = {
    ...fact,
    id: localId("f"),
    created_at: new Date().toISOString(),
  } as FunFact;
  writeLS(LS_KEYS.funFacts, [...facts, created]);
  return created;
}

export async function deleteFunFact(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("fun_facts").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const facts = readLS<FunFact[]>(LS_KEYS.funFacts, MOCK_FUN_FACTS);
  writeLS(
    LS_KEYS.funFacts,
    facts.filter((f) => f.id !== id)
  );
}

// ---------------------------------------------------------------
// Profile (points, streak)
// ---------------------------------------------------------------

const GUEST_PROFILE: UserProfile = {
  id: "guest",
  name: "Explorer",
  email: "guest@konkaniquest.app",
  points: 0,
  streak: 0,
  last_active_date: null,
  is_admin: true, // demo mode: everyone can try the admin dashboard
  created_at: new Date(0).toISOString(),
};

export async function fetchProfile(): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();
    if (error) throw error;
    return data as UserProfile;
  }
  return readLS<UserProfile>(LS_KEYS.profile, GUEST_PROFILE);
}

export async function updateProfile(
  patch: Partial<Pick<UserProfile, "points" | "streak" | "last_active_date" | "name">>
): Promise<UserProfile> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    const { data, error } = await supabase
      .from("users")
      .update(patch)
      .eq("id", user.id)
      .select()
      .single();
    if (error) throw error;
    return data as UserProfile;
  }
  const profile = readLS<UserProfile>(LS_KEYS.profile, GUEST_PROFILE);
  const updated = { ...profile, ...patch };
  writeLS(LS_KEYS.profile, updated);
  return updated;
}

// ---------------------------------------------------------------
// Progress
// ---------------------------------------------------------------

export async function fetchProgress(): Promise<ProgressEntry[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from("progress")
      .select("*")
      .eq("user_id", user.id);
    if (error) throw error;
    return data as ProgressEntry[];
  }
  return readLS<ProgressEntry[]>(LS_KEYS.progress, []);
}

export async function upsertProgress(
  wordId: string,
  status: WordStatus
): Promise<ProgressEntry> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");

    const { data: existing } = await supabase
      .from("progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("word_id", wordId)
      .maybeSingle();

    const attempts = (existing?.attempts ?? 0) + 1;
    const { data, error } = await supabase
      .from("progress")
      .upsert(
        {
          user_id: user.id,
          word_id: wordId,
          status,
          attempts,
          last_seen: now,
        },
        { onConflict: "user_id,word_id" }
      )
      .select()
      .single();
    if (error) throw error;
    return data as ProgressEntry;
  }

  const entries = readLS<ProgressEntry[]>(LS_KEYS.progress, []);
  const existing = entries.find((e) => e.word_id === wordId);
  let entry: ProgressEntry;
  if (existing) {
    entry = { ...existing, status, attempts: existing.attempts + 1, last_seen: now };
    writeLS(
      LS_KEYS.progress,
      entries.map((e) => (e.word_id === wordId ? entry : e))
    );
  } else {
    entry = {
      id: localId("p"),
      user_id: "guest",
      word_id: wordId,
      status,
      attempts: 1,
      last_seen: now,
    };
    writeLS(LS_KEYS.progress, [...entries, entry]);
  }
  return entry;
}

// ---------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------

export async function signInWithPassword(email: string, password: string) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUpWithPassword(
  name: string,
  email: string,
  password: string
) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
}

export async function signOut() {
  const supabase = getSupabaseClient();
  if (supabase) await supabase.auth.signOut();
}
