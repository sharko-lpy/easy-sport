import type { BodyZone } from "@/components/BodyDiagram";

export type Category = {
  slug: string;
  label: string;
  subtitle: string;
  zone: BodyZone;
};

export const CATEGORIES: Category[] = [
  { slug: "bras-epaules", label: "Bras & Épaules", subtitle: "Renforcement ciblé", zone: "arms" },
  { slug: "abdos-torse", label: "Abdos & Torse", subtitle: "Gainage & sangle abdominale", zone: "core" },
  { slug: "jambes", label: "Jambes", subtitle: "Renforcement & tonification", zone: "legs" },
  { slug: "cardio", label: "Cardio", subtitle: "Endurance & brûle-graisses", zone: "cardio" },
];
