interface MascotProps {
  size?: number;
  className?: string;
}

/**
 * "Kingu" — a cheerful coastal kingfisher-parrot mascot, drawn inline as
 * SVG so it needs no assets. Inspired by the birds of the Konkan coast.
 */
export function Mascot({ size = 96, className = "" }: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Kingu the kingfisher mascot"
    >
      {/* tail feathers */}
      <path d="M28 86 Q10 100 14 112 Q30 106 38 94 Z" fill="#0e7490" />
      <path d="M34 90 Q22 102 26 112 Q38 104 44 96 Z" fill="#06b6d4" />
      {/* body */}
      <ellipse cx="62" cy="70" rx="38" ry="42" fill="#0891b2" />
      {/* belly */}
      <ellipse cx="66" cy="82" rx="24" ry="26" fill="#fff8ec" />
      {/* wing */}
      <path
        d="M38 62 Q24 78 36 96 Q52 92 54 74 Q50 62 38 62 Z"
        fill="#ff6f61"
      />
      <path
        d="M42 70 Q36 80 42 90"
        stroke="#e85546"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* head */}
      <circle cx="74" cy="38" r="26" fill="#0891b2" />
      {/* head crest */}
      <path d="M62 16 Q66 6 74 12 Q78 4 84 12 Q90 8 90 18 Z" fill="#ffb020" />
      {/* face patch */}
      <circle cx="80" cy="42" r="15" fill="#fff8ec" />
      {/* eye */}
      <circle cx="80" cy="38" r="6.5" fill="#1e3a3a" />
      <circle cx="82.5" cy="35.5" r="2.2" fill="#ffffff" />
      {/* beak */}
      <path d="M92 42 L112 47 L92 54 Q88 48 92 42 Z" fill="#ffb020" />
      <path d="M92 49 L106 50 L92 54 Q90 51 92 49 Z" fill="#f59e0b" />
      {/* cheek blush */}
      <circle cx="72" cy="48" r="4" fill="#ffb3ab" opacity="0.8" />
      {/* feet */}
      <path
        d="M56 108 L56 114 M62 108 L62 115 M76 108 L76 114 M82 108 L82 115"
        stroke="#f59e0b"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
