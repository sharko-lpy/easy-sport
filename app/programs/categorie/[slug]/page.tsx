import { notFound } from "next/navigation";
import BodyDiagram from "@/components/BodyDiagram";
import { CATEGORIES } from "@/lib/categories";

export default function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = CATEGORIES.find((c) => c.slug === params.slug);
  if (!category) notFound();

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-4 py-10 text-center"
      style={{
        background:
          "radial-gradient(circle at 75% 15%, rgba(236,72,153,0.55), transparent 45%), " +
          "radial-gradient(circle at 20% 85%, rgba(147,51,234,0.45), transparent 50%), " +
          "linear-gradient(160deg, #1a0b2e 0%, #2b0845 45%, #4a0d5c 100%)",
      }}
    >
      <BodyDiagram zone={category.zone} className="h-56 w-auto" />
      <h1 className="mt-6 text-3xl font-extrabold text-white">
        {category.label}
      </h1>
      <p className="mt-2 text-white/70">{category.subtitle}</p>
      <p className="mt-8 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm text-white/80 backdrop-blur">
        Bientôt disponible
      </p>
      <a
        href="/programs"
        className="mt-8 text-sm text-white/60 underline decoration-white/30 underline-offset-4 hover:text-white/90"
      >
        ← Retour à l'accueil
      </a>
    </main>
  );
}
