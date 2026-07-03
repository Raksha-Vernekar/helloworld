import { NextResponse } from "next/server";
import { generateSuggestions } from "@/lib/ai";
import type { AIHints } from "@/lib/types";

/**
 * POST /api/ai/suggest
 * Body: { english: string; konkani: string; hints?: AIHints }
 * Returns: { mnemonics: string[]; imageIdeas: string[]; explanation: string }
 *
 * Currently backed by the template-based mock in src/lib/ai.ts.
 * Swap the `generateSuggestions` call for a real LLM call to upgrade —
 * the response contract stays the same. See README.md.
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

  const suggestions = generateSuggestions(english, konkani, body.hints);
  return NextResponse.json(suggestions);
}
