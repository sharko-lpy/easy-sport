export type BodyZone = "arms" | "core" | "legs" | "cardio";

const MUTED = "rgba(255,255,255,0.22)";
const HL = "url(#bodyGradient)";

// Silhouette façon "carte musculaire" (bras légèrement écartés pour bien
// distinguer chaque groupe) : la zone ciblée par la catégorie est mise en
// rose, le reste reste neutre. Le "cardio" met tout le corps en avant avec
// un cœur en surimpression sur le torse.
export default function BodyDiagram({
  zone,
  className,
}: {
  zone: BodyZone;
  className?: string;
}) {
  const isArms = zone === "arms" || zone === "cardio";
  const isCore = zone === "core" || zone === "cardio";
  const isLegs = zone === "legs" || zone === "cardio";

  const arms = isArms ? HL : MUTED;
  const core = isCore ? HL : MUTED;
  const legs = isLegs ? HL : MUTED;

  return (
    <svg
      viewBox="0 0 200 400"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bodyGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f9a8d4" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
      </defs>

      {/* Tête + cou (toujours neutres) */}
      <circle cx="100" cy="28" r="20" fill={MUTED} />
      <rect x="90" y="46" width="20" height="14" rx="5" fill={MUTED} />

      {/* Deltoïdes */}
      <circle cx="55" cy="78" r="17" fill={arms} />
      <circle cx="145" cy="78" r="17" fill={arms} />

      {/* Pectoraux */}
      <ellipse cx="82" cy="95" rx="20" ry="16" fill={core} />
      <ellipse cx="118" cy="95" rx="20" ry="16" fill={core} />

      {/* Abdos (tablette) */}
      <rect x="86" y="115" width="12" height="16" rx="4" fill={core} />
      <rect x="102" y="115" width="12" height="16" rx="4" fill={core} />
      <rect x="86" y="134" width="12" height="16" rx="4" fill={core} />
      <rect x="102" y="134" width="12" height="16" rx="4" fill={core} />
      <rect x="86" y="153" width="12" height="16" rx="4" fill={core} />
      <rect x="102" y="153" width="12" height="16" rx="4" fill={core} />

      {/* Obliques */}
      <rect x="72" y="115" width="10" height="55" rx="5" fill={core} />
      <rect x="118" y="115" width="10" height="55" rx="5" fill={core} />

      {/* Bassin */}
      <ellipse cx="100" cy="185" rx="38" ry="18" fill={legs} />

      {/* Biceps */}
      <rect x="30" y="85" width="16" height="70" rx="8" fill={arms} transform="rotate(-12 38 85)" />
      <rect x="154" y="85" width="16" height="70" rx="8" fill={arms} transform="rotate(12 162 85)" />

      {/* Avant-bras */}
      <rect x="15" y="150" width="14" height="65" rx="7" fill={arms} transform="rotate(-20 22 150)" />
      <rect x="171" y="150" width="14" height="65" rx="7" fill={arms} transform="rotate(20 178 150)" />

      {/* Quadriceps */}
      <rect x="68" y="200" width="28" height="90" rx="14" fill={legs} />
      <rect x="104" y="200" width="28" height="90" rx="14" fill={legs} />

      {/* Mollets */}
      <rect x="70" y="295" width="22" height="75" rx="11" fill={legs} />
      <rect x="108" y="295" width="22" height="75" rx="11" fill={legs} />

      {zone === "cardio" && (
        <g transform="translate(100,95) scale(1.8) translate(-12,-13)">
          <path
            d="M12 21s-6.716-4.365-9.428-8.428C.29 9.487 1.5 5 6 5c2.3 0 3.7 1.2 4.5 2.6C11.3 6.2 12.7 5 15 5c4.5 0 5.71 4.487 3.428 7.572C18.716 16.635 12 21 12 21z"
            fill="#fff"
          />
        </g>
      )}
    </svg>
  );
}
