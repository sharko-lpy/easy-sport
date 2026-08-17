import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";

export default async function ProgramsPage() {
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

  return (
    <>
      <NavBar fullName={profile?.full_name} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">
          Mes programmes
        </h1>

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
      </main>
    </>
  );
}
