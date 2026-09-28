export type Difficulty = "beginner" | "intermediate" | "advanced";

export type WordStatus = "new" | "learning" | "mastered";

export interface Word {
  id: string;
  english_word: string;
  konkani_word: string;
  pronunciation: string;
  category: string;
  difficulty: Difficulty;
  mnemonic: string;
  image_prompt: string;
  image_url: string;
  example_sentence: string;
  fun_fact_trigger?: string | null;
  created_at: string;
}

export interface FunFact {
  id: string;
  fact_text: string;
  unlock_points: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  points: number;
  streak: number;
  last_active_date: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface ProgressEntry {
  id: string;
  user_id: string;
  word_id: string;
  status: WordStatus;
  attempts: number;
  last_seen: string;
}

export interface MnemonicSuggestions {
  mnemonics: string[];
  imagePrompts: string[];
  pronunciationTip: string;
}

export interface AIHints {
  soundsLike?: string;
  object1?: string;
  object2?: string;
  sceneIdea?: string;
}

export const CATEGORIES = [
  "general",
  "body",
  "family",
  "food",
  "nature",
  "animals",
  "places",
  "feelings",
  "numbers",
  "greetings",
] as const;

export const DIFFICULTIES: Difficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];

export const POINTS_PER_WORD = 10;
export const FUN_FACT_INTERVAL = 50;
export const SESSION_SIZE = 10;
