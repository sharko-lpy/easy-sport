import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";

export default async function CoachHomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "coach") redirect("/programs");

  const { data: programs } = await supabase
    .from("programs")
    .select("id, title, description, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <NavBar fullName={profile?.full_name} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Mes programmes</h1>
          <a
            href="/coach/programs/new"
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            + Nouveau programme
          </a>
        </div>

        {!programs || programs.length === 0 ? (
          <p className="text-slate-600">
            Tu n'as pas encore créé de programme.
          </p>
        ) : (
          <ul className="space-y-3">
            {programs.map((program) => (
              <li key={program.id}>
                <a
                  href={`/coach/programs/${program.id}`}
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
