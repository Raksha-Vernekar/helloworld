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
| `/learn`           | Lesson cards: reveal Konkani, mnemonic, image idea, +10 XP |
| `/practice`        | Shuffled review of words you've already seen              |
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

## Connecting real AI (text + images)

All AI traffic goes through one server route:
`src/app/api/ai/suggest/route.ts`, which currently calls the mock generator
in `src/lib/ai.ts`. The response contract is:

```json
{
  "mnemonics": ["...", "...", "..."],
  "imageIdeas": ["...", "...", "..."],
  "explanation": "..."
}
```

Because the admin UI (`AISuggestionBox`) only depends on this contract, you
can swap in any provider without touching the frontend.

### 1. Real text suggestions (OpenAI example)

```bash
npm install openai
echo "OPENAI_API_KEY=sk-..." >> .env.local
```

Replace the `generateSuggestions(...)` call in the route with:

```ts
import OpenAI from "openai";

const openai = new OpenAI(); // reads OPENAI_API_KEY

const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  response_format: { type: "json_object" },
  messages: [
    {
      role: "system",
      content:
        "You create playful memory aids for English speakers learning Konkani. " +
        'Reply as JSON: {"mnemonics": [3 strings], "imageIdeas": [3 strings], "explanation": string}.',
    },
    {
      role: "user",
      content:
        `English: ${english}\nKonkani: ${konkani}\n` +
        (body.hints
          ? `Admin hints — sounds like: ${body.hints.soundsLike ?? "-"}, ` +
            `object 1: ${body.hints.object1 ?? "-"}, object 2: ${body.hints.object2 ?? "-"}, ` +
            `scene: ${body.hints.sceneIdea ?? "-"}`
          : ""),
    },
  ],
});

const suggestions = JSON.parse(completion.choices[0].message.content!);
```

The admin "hints" flow (sounds-like word, object 1, object 2, scene idea)
already sends those fields to the route — just include them in the prompt as
above.

### 2. Real generated images

Add a second route, e.g. `src/app/api/ai/image/route.ts`, that takes an
`image_prompt` and returns an image URL:

- **OpenAI Images** (`openai.images.generate({ model: "gpt-image-1", prompt })`),
- or Stability AI / Replicate / fal.ai — any provider that returns a URL or bytes.

Then upload the result to a **Supabase Storage** bucket (e.g. `word-images`)
and save its public URL into `words.image_url`. Recommended flow: put a
"Generate image" button next to the *Image prompt* field in `AdminWordForm`
that calls the new route and fills `image_url` automatically. Until then,
placeholder URLs from [placehold.co](https://placehold.co) work fine.

## Game rules

- **+10 XP** for every word completed with "I remembered it".
- "Practice again" keeps the word in rotation without awarding XP.
- Words progress `new → learning → mastered` (two successful recalls).
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
