export type BodyZone = "arms" | "core" | "legs" | "cardio";

const MUTED = "rgba(255,255,255,0.22)";
const HL = "url(#bodyGradient)";

// Silhouette stylisée (poids du corps féminin, hanches marquées) servant
// d'icône : les zones ciblées sont mises en évidence en rose, le reste reste
// neutre. Le "cardio" met tout le corps en avant avec un cœur en surimpression.
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

  return (
    <svg
      viewBox="0 0 160 300"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bodyGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f9a8d4" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
      </defs>

      {/* Tête + cou */}
      <circle cx="80" cy="34" r="20" fill={MUTED} />
      <rect x="70" y="50" width="20" height="18" rx="6" fill={MUTED} />

      {/* Épaules + bras */}
      <circle cx="37" cy="68" r="12" fill={isArms ? HL : MUTED} />
      <circle cx="123" cy="68" r="12" fill={isArms ? HL : MUTED} />
      <rect x="28" y="68" width="18" height="100" rx="9" fill={isArms ? HL : MUTED} />
      <rect x="114" y="68" width="18" height="100" rx="9" fill={isArms ? HL : MUTED} />

      {/* Torse + abdos */}
      <ellipse cx="80" cy="85" rx="38" ry="32" fill={isCore ? HL : MUTED} />
      <ellipse cx="80" cy="140" rx="26" ry="28" fill={isCore ? HL : MUTED} />

      {/* Hanches + jambes */}
      <ellipse cx="80" cy="175" rx="34" ry="26" fill={isLegs ? HL : MUTED} />
      <rect x="54" y="195" width="22" height="95" rx="11" fill={isLegs ? HL : MUTED} />
      <rect x="84" y="195" width="22" height="95" rx="11" fill={isLegs ? HL : MUTED} />

      {zone === "cardio" && (
        <g transform="translate(80,85) scale(1.6) translate(-12,-13)">
          <path
            d="M12 21s-6.716-4.365-9.428-8.428C.29 9.487 1.5 5 6 5c2.3 0 3.7 1.2 4.5 2.6C11.3 6.2 12.7 5 15 5c4.5 0 5.71 4.487 3.428 7.572C18.716 16.635 12 21 12 21z"
            fill="#fff"
          />
        </g>
      )}
    </svg>
  );
}
