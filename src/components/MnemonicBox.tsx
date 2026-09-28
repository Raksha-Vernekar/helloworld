"use client";

interface MnemonicBoxProps {
  mnemonic: string;
  imagePrompt: string;
}

/**
 * Shows the memory trick and the AI-style image idea for a word,
 * e.g. "A nose knocking on a door" for Nose → Naak → Knock.
 */
export function MnemonicBox({ mnemonic, imagePrompt }: MnemonicBoxProps) {
  return (
    <div className="space-y-3">
      {mnemonic && (
        <div className="rounded-2xl bg-mango/15 border-2 border-mango/40 p-4">
          <p className="text-xs font-extrabold uppercase tracking-wider text-mango-deep mb-1">
            🧠 Memory trick
          </p>
          <p className="text-sm sm:text-base font-semibold text-ink">{mnemonic}</p>
        </div>
      )}
      {imagePrompt && (
        <div className="rounded-2xl bg-lagoon/10 border-2 border-lagoon/30 p-4">
          <p className="text-xs font-extrabold uppercase tracking-wider text-sea-deep mb-1">
            🎨 Picture this
          </p>
          <p className="text-sm sm:text-base font-semibold text-ink italic">
            “{imagePrompt}”
          </p>
        </div>
      )}
    </div>
  );
}
