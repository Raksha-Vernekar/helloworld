# 🦜 Konkani Quest

A cheerful, Duolingo-style web app for learning **Konkani** — one word, one
silly picture, one unforgettable mnemonic at a time.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS + Supabase**,
with a friendly coastal-kingfisher mascot, XP points, streaks, confetti, and
fun facts that unlock every 50 XP.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000 — the app boots in **demo mode** with 10 seeded
words and 8 fun facts. No database or API keys needed:

- Learner progress (XP, streak, word statuses) persists in `localStorage`.
- The admin dashboard is open to everyone and edits are saved locally.
- The AI helper returns template-based mock suggestions.

## Pages

| Route              | What it does                                              |
| ------------------ | --------------------------------------------------------- |
| `/`                | Landing page with mascot and CTA                          |
| `/login`           | Sign in / sign up (Supabase) or continue as guest (demo)  |
| `/learn`           | 10-word lesson sessions: study → 4-option quiz → +10 XP   |
| `/practice`        | Spaced-repetition review of words you've already seen     |
| `/progress`        | XP, streak, mastery bar, word list, unlocked fun facts    |
| `/admin`           | Admin dashboard (stats + links)                           |
| `/admin/words`     | Add / edit / delete words, with the AI helper             |
| `/admin/fun-facts` | Add / edit / delete fun facts and their unlock points     |

## Reusable components

`LessonCard`, `RevealButton`, `MnemonicBox`, `PointsBar`, `FunFactModal`,
`AdminWordForm`, `AISuggestionBox` — all in `src/components/`, plus
`Mascot` (inline SVG, no assets), `AppShell` (header + bottom nav), and
`QuestProvider` (XP/streak/progress state).

## Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql` (tables, triggers, RLS
   policies), then `supabase/seed.sql` (starter words and fun facts).
3. Copy `.env.example` to `.env.local` and fill in your keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

4. Restart the dev server. Login now uses real Supabase auth, and all
   words/facts/progress are stored in Postgres.
5. Make yourself an admin:

```sql
update public.users set is_admin = true where email = 'you@example.com';
```

The schema includes row-level security: learners can only touch their own
profile/progress; only admins can write words and fun facts.

### Database tables

- `users` — id, name, email, points, streak, last_active_date, is_admin, created_at
- `words` — english_word, konkani_word, pronunciation, category, difficulty,
  mnemonic, image_prompt, image_url, example_sentence, fun_fact_trigger
- `progress` — user_id, word_id, status (new/learning/mastered), attempts, last_seen
- `fun_facts` — fact_text, unlock_points

## AI suggestion service

The service lives in `src/lib/aiService.ts` and exposes one function:

```ts
generateMnemonicSuggestions(englishWord, konkaniWord, hints?)
```

It returns:

```json
{
  "mnemonics": ["3 mnemonic ideas"],
  "imagePrompts": ["3 visual image prompts"],
  "pronunciationTip": "1 beginner-friendly pronunciation tip"
}
```

It is provider-based:

- **Mock provider** (default) — playful template-generated suggestions,
  deterministic per word pair, zero configuration.
- **OpenAI provider** — used automatically when `OPENAI_API_KEY` is set in
  `.env.local` (optionally `OPENAI_MODEL`, default `gpt-4o-mini`). It calls
  the Chat Completions API with a JSON response format and falls back to
  the mock if the request fails, so the admin is never left empty-handed.

The admin UI calls it through `POST /api/ai/suggest` (server-side, so your
API key never reaches the browser). The "hints" flow (sounds-like word,
object 1, object 2, scene idea) is passed straight into the provider — the
mock uses them in its templates and the OpenAI provider adds them to the
prompt. To add another provider (Anthropic, Gemini, a local model), just
implement the `SuggestionProvider` interface and swap it in `pickProvider()`.

### Real generated images

Add a second route, e.g. `src/app/api/ai/image/route.ts`, that takes an
`image_prompt` and returns an image URL:

- **OpenAI Images** (`openai.images.generate({ model: "gpt-image-1", prompt })`),
- or Stability AI / Replicate / fal.ai — any provider that returns a URL or bytes.

Then upload the result to a **Supabase Storage** bucket (e.g. `word-images`)
and save its public URL into `words.image_url`. Recommended flow: put a
"Generate image" button next to the *Image prompt* field in `AdminWordForm`
that calls the new route and fills `image_url` automatically. Until then,
placeholder URLs from [placehold.co](https://placehold.co) work fine.

## Learning flow & game rules

Each `/learn` session picks up to **10 words** by spaced-repetition
priority (`src/lib/spacedRepetition.ts`). Every word goes through:

1. See the English word and image — take a mental guess
2. **Reveal Konkani** — word + pronunciation
3. Read the mnemonic and image idea
4. **Quiz**: "Which is the Konkani word for X?" with 4 options
5. Instant feedback — green confetti when right, gentle encouragement
   (and the correct answer) when wrong
6. **+10 XP only when correct**

Spaced repetition rules:

- Wrong answers are re-inserted a couple of cards later in the same
  session, and drop the word back to `learning` so it returns sooner in
  future sessions.
- New words get top priority; `learning` words bubble up the longer
  they've been unseen; `mastered` words appear rarely and only drift back
  as they go stale.
- A word reaches `mastered` after a clean first-try correct answer on a
  word already in `learning`.
- Every **50 XP** unlocks the next fun fact, with a confetti celebration.
- Practicing on consecutive days grows your **🔥 streak**; missing a day
  resets it.

## Scripts

```bash
npm run dev     # start the dev server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```
