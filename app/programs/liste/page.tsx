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
      <NavBar fullName={profile?.full_name} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <a href="/programs" className="mb-6 inline-block text-sm text-brand">
          ← Retour à l'accueil
        </a>

        {defaultProgram && (
          <section className="mb-10">
            <h1 className="mb-3 text-2xl font-bold text-slate-900">
              Programme perso
            </h1>
            <a
              href={`/programs/${defaultProgram.id}`}
              className="block rounded-lg border border-brand bg-brand/5 p-4 hover:border-brand"
            >
              <p className="font-medium text-slate-900">
                {defaultProgram.title}
              </p>
              {defaultProgram.description && (
                <p className="mt-1 text-sm text-slate-600">
                  {defaultProgram.description}
                </p>
              )}
            </a>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Mes programmes (coach)
          </h2>

          {programs.length === 0 ? (
            <p className="text-slate-600">
              Aucun programme ne t'a encore été assigné par ton coach.
            </p>
          ) : (
            <ul className="space-y-3">
              {programs.map((program) => (
                <li key={program.id}>
                  <a
                    href={`/programs/${program.id}`}
                    className="block rounded-lg border border-slate-200 p-4 hover:border-brand"
                  >
                    <p className="font-medium text-slate-900">
                      {program.title}
                    </p>
                    {program.description && (
                      <p className="mt-1 text-sm text-slate-600">
                        {program.description}
                      </p>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
