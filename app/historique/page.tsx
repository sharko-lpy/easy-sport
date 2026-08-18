import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";
import ActivityHistoryView from "@/components/ActivityHistoryView";

export default async function HistoriquePage() {
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

  const { data: logs } = await supabase
    .from("workout_logs")
    .select(
      "id, performed_at, sets_completed, reps_completed, weight_kg, program_exercise_id"
    )
    .eq("athlete_id", user.id)
    .order("performed_at", { ascending: false })
    .limit(200);

  const exerciseIds = [
    ...new Set((logs ?? []).map((l) => l.program_exercise_id)),
  ];

  const { data: exercises } = exerciseIds.length
    ? await supabase
        .from("program_exercises")
        .select("id, name")
        .in("id", exerciseIds)
    : { data: [] as { id: string; name: string }[] };

  const nameById = new Map((exercises ?? []).map((e) => [e.id, e.name]));

  const rows = (logs ?? []).map((l) => ({
    id: l.id,
    performed_at: l.performed_at,
    sets_completed: l.sets_completed,
    reps_completed: l.reps_completed,
    weight_kg: l.weight_kg,
    exerciseName: nameById.get(l.program_exercise_id) ?? "Exercice",
  }));

  return (
    <>
      <NavBar fullName={profile?.full_name} role={profile?.role} />
      <main className="app-bg min-h-screen px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <a href="/programs" className="mb-4 inline-block text-sm text-pink-300">
            ← Retour à l'accueil
          </a>
          <h1 className="mb-6 text-2xl font-bold text-white">Historique</h1>
          <ActivityHistoryView logs={rows} />
        </div>
      </main>
    </>
  );
}
