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
      <main className="mx-auto max-w-3xl px-4 py-8">
        <a href="/admin" className="mb-4 inline-block text-sm text-brand">
          ← Tous les utilisateurs
        </a>
        <h1 className="mb-6 text-2xl font-bold text-slate-900">
          {athlete.full_name ?? athlete.username ?? "Athlète"}
        </h1>
        <AdminAthleteEditor athlete={athlete} adminId={user.id} />
      </main>
    </>
  );
}
