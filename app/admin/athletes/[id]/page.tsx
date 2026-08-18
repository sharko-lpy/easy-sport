import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";
import AdminAthleteEditor from "@/components/AdminAthleteEditor";

export default async function AdminAthletePage({
  params,
}: {
  params: { id: string };
}) {
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

  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: athlete } = await supabase
    .from("profiles")
    .select("id, full_name, username, motivational_quote")
    .eq("id", params.id)
    .eq("role", "athlete")
    .maybeSingle();

  if (!athlete) notFound();

  return (
    <>
      <NavBar fullName={profile?.full_name} role={profile?.role} />
      <main className="app-bg min-h-screen px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <a href="/admin" className="mb-4 inline-block text-sm text-pink-300">
            ← Tous les utilisateurs
          </a>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              {athlete.full_name ?? athlete.username ?? "Athlète"}
            </h1>
            <a
              href={`/admin/athletes/${athlete.id}/historique`}
              className="text-sm text-pink-300 hover:underline"
            >
              Voir l'historique
            </a>
          </div>
          <AdminAthleteEditor athlete={athlete} adminId={user.id} />
        </div>
      </main>
    </>
  );
}
