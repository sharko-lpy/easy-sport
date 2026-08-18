import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BodyDiagram from "@/components/BodyDiagram";
import LogoutButton from "@/components/LogoutButton";
import { CATEGORIES } from "@/lib/categories";

export default async function ProgramsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, motivational_quote")
    .eq("id", user.id)
    .single();

  const { data: assignments } = await supabase
    .from("program_assignments")
    .select("program_id")
    .eq("athlete_id", user.id);

  const programIds = (assignments ?? []).map((a) => a.program_id);

  const { data: categoryPrograms } = programIds.length
    ? await supabase
        .from("programs")
        .select("id, category")
        .in("id", programIds)
        .not("category", "is", null)
    : { data: [] as { id: string; category: string | null }[] };

  const programIdByCategory = new Map(
    (categoryPrograms ?? []).map((p) => [p.category, p.id])
  );

  return (
    <main className="app-bg min-h-screen px-4 py-10">
      <div className="mx-auto flex max-w-4xl items-center justify-end gap-4">
        <a
          href="/historique"
          className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur hover:bg-white/20"
        >
          Historique
        </a>
        <LogoutButton />
      </div>

      <div className="mx-auto mt-4 max-w-4xl text-center">
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
          Bienvenue {profile?.full_name ?? ""} !
        </h1>
        <p className="mt-3 text-white/70">Choisis ton programme du jour</p>
      </div>

      {profile?.motivational_quote && (
        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-white/15 bg-white/5 px-6 py-5 text-center backdrop-blur-md">
          <p className="text-lg italic text-white/90">
            « {profile.motivational_quote} »
          </p>
        </div>
      )}

      <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
        {CATEGORIES.map((cat) => {
          const programId = programIdByCategory.get(cat.slug);
          const href = programId
            ? `/programs/${programId}`
            : `/programs/categorie/${cat.slug}`;

          return (
            <a
              key={cat.slug}
              href={href}
              className="flex flex-col items-center rounded-3xl border border-white/15 bg-white/10 px-4 py-6 text-center backdrop-blur-md transition hover:border-pink-300/60 hover:bg-white/15"
            >
              <BodyDiagram zone={cat.zone} className="h-40 w-auto sm:h-48" />
              <h3 className="mt-2 text-sm font-semibold text-white sm:text-base">
                {cat.label}
              </h3>
              <p className="mt-1 text-xs text-white/60">{cat.subtitle}</p>
            </a>
          );
        })}
      </div>

      <div className="mx-auto mt-12 max-w-4xl text-center">
        <a
          href="/programs/liste"
          className="text-sm text-white/60 underline decoration-white/30 underline-offset-4 hover:text-white/90"
        >
          Voir mes programmes assignés par mon coach
        </a>
      </div>
    </main>
  );
}
