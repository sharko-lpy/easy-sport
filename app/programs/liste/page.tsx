import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";

export default async function ProgramsListPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: assignments } = await supabase
    .from("program_assignments")
    .select("program_id")
    .eq("athlete_id", user.id);

  const programIds = (assignments ?? []).map((a) => a.program_id);

  const { data: programsData } = programIds.length
    ? await supabase
        .from("programs")
        .select("id, title, description")
        .in("id", programIds)
    : { data: [] as { id: string; title: string; description: string | null }[] };

  const programs = programsData ?? [];

  const { data: defaultProgram } = await supabase
    .from("programs")
    .select("id, title, description")
    .eq("is_default", true)
    .maybeSingle();

  return (
    <>
      <NavBar fullName={profile?.full_name} role="athlete" />
      <main className="app-bg min-h-screen px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <a href="/programs" className="mb-6 inline-block text-sm text-pink-300">
            ← Retour à l'accueil
          </a>

          {defaultProgram && (
            <section className="mb-10">
              <h1 className="mb-3 text-2xl font-bold text-white">
                Programme perso
              </h1>
              <a
                href={`/programs/${defaultProgram.id}`}
                className="glass-card block border-pink-300/40 p-4 hover:border-pink-300/70"
              >
                <p className="font-medium text-white">
                  {defaultProgram.title}
                </p>
                {defaultProgram.description && (
                  <p className="mt-1 text-sm text-white/60">
                    {defaultProgram.description}
                  </p>
                )}
              </a>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">
              Mes programmes (coach)
            </h2>

            {programs.length === 0 ? (
              <p className="text-white/60">
                Aucun programme ne t'a encore été assigné par ton coach.
              </p>
            ) : (
              <ul className="space-y-3">
                {programs.map((program) => (
                  <li key={program.id}>
                    <a
                      href={`/programs/${program.id}`}
                      className="glass-card block p-4 hover:border-pink-300/60"
                    >
                      <p className="font-medium text-white">
                        {program.title}
                      </p>
                      {program.description && (
                        <p className="mt-1 text-sm text-white/60">
                          {program.description}
                        </p>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
