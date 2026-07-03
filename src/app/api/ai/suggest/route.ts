import { NextResponse } from "next/server";
import { generateMnemonicSuggestions } from "@/lib/aiService";
import type { AIHints } from "@/lib/types";

/**
 * POST /api/ai/suggest
 * Body: { english: string; konkani: string; hints?: AIHints }
 * Returns: { mnemonics: string[]; imagePrompts: string[]; pronunciationTip: string }
 *
 * Backed by src/lib/aiService.ts: uses the local mock by default and the
 * OpenAI API automatically when OPENAI_API_KEY is set.
 */
export async function POST(request: Request) {
  let body: { english?: string; konkani?: string; hints?: AIHints };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const english = body.english?.trim();
  const konkani = body.konkani?.trim();
  if (!english || !konkani) {
    return NextResponse.json(
      { error: "Both 'english' and 'konkani' are required" },
      { status: 400 }
    );
  }

  const suggestions = await generateMnemonicSuggestions(english, konkani, body.hints);
  return NextResponse.json(suggestions);
}
