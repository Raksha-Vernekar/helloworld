import type { ProgressEntry, Word, WordStatus } from "./types";
import { SESSION_SIZE } from "./types";

/**
 * Lightweight spaced repetition for lesson sessions.
 *
 * Priority rules:
 *  - New words come first (highest base score).
 *  - "Learning" words come back often, and sooner the longer it's been
 *    since they were last seen.
 *  - "Mastered" words appear rarely, drifting back in as they get stale.
 *
 * Within a session, wrongly answered words are re-inserted near the front
 * of the queue (see `requeuePosition`) so they show up again quickly.
 */

const BASE_SCORE: Record<WordStatus, number> = {
  new: 100,
  learning: 70,
  mastered: 10,
};

function hoursSince(iso: string): number {
  return Math.max(0, (Date.now() - new Date(iso).getTime()) / 36e5);
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Higher score = should be shown sooner. */
export function priorityScore(word: Word, entry: ProgressEntry | undefined): number {
  if (!entry) return BASE_SCORE.new;

  const staleness = hoursSince(entry.last_seen);
  if (entry.status === "learning") {
    // Struggling words (more attempts) and stale words bubble up.
    return BASE_SCORE.learning + Math.min(staleness, 24) + Math.min(entry.attempts * 2, 10);
  }
  if (entry.status === "mastered") {
    // Mastered words only creep back as they get stale (max +25 over ~5 days).
    return BASE_SCORE.mastered + Math.min(staleness / 5, 25);
  }
  return BASE_SCORE.new;
}

/**
 * Picks up to `size` words for a lesson session, ordered by priority.
 * `salt` varies the tie-breaking so back-to-back sessions don't repeat
 * the exact same order.
 */
export function buildSession(
  words: Word[],
  progress: ProgressEntry[],
  size: number = SESSION_SIZE,
  salt: number = 0
): Word[] {
  const entryByWord = new Map(progress.map((p) => [p.word_id, p]));
  return [...words]
    .map((w) => ({
      word: w,
      score: priorityScore(w, entryByWord.get(w.id)),
      tie: hash(`${w.id}:${salt}`),
    }))
    .sort((a, b) => b.score - a.score || a.tie - b.tie)
    .slice(0, size)
    .map((x) => x.word);
}

/** Where to re-insert a word the learner got wrong (soon, but not instantly). */
export function requeuePosition(queueLength: number): number {
  return Math.min(2, queueLength);
}

/**
 * Status transition after a quiz answer.
 * Correct on the first try advances the word; any wrong answer drops it
 * back to "learning" so it repeats sooner.
 */
export function nextStatus(
  current: WordStatus,
  correct: boolean,
  hadWrongThisSession: boolean
): WordStatus {
  if (!correct) return "learning";
  if (hadWrongThisSession) return "learning";
  return current === "new" ? "learning" : "mastered";
}

/** Builds 4 quiz options (1 correct + 3 distractors), shuffled. */
export function buildQuizOptions(word: Word, allWords: Word[], salt: number): string[] {
  const pool = allWords.filter(
    (w) => w.id !== word.id && w.konkani_word.toLowerCase() !== word.konkani_word.toLowerCase()
  );
  // Prefer distractors from the same category so the quiz isn't too easy.
  const sameCategory = pool.filter((w) => w.category === word.category);
  const rest = pool.filter((w) => w.category !== word.category);
  const ordered = [...shuffle(sameCategory, salt), ...shuffle(rest, salt + 1)];
  const distractors = ordered.slice(0, 3).map((w) => w.konkani_word);
  return shuffle([word.konkani_word, ...distractors], salt + word.id.length);
}

function shuffle<T>(arr: T[], salt: number): T[] {
  return [...arr]
    .map((item, i) => ({ item, key: hash(`${i}:${salt}:${String(item)}`) }))
    .sort((a, b) => a.key - b.key)
    .map((x) => x.item);
}
