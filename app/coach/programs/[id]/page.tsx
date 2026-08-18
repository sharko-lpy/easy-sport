"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Exercise = {
  id: string;
  name: string;
  sets: number | null;
  reps: number | null;
  notes: string | null;
  order_index: number;
};

type Athlete = { id: string; full_name: string | null };

export default function ProgramDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const programId = params.id;

  const [title, setTitle] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [allAthletes, setAllAthletes] = useState<Athlete[]>([]);
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState<number | "">("");
  const [reps, setReps] = useState<number | "">("");

  const loadData = useCallback(async () => {
    setLoading(true);

    const [{ data: program }, { data: exercisesData }, { data: athletes }, { data: assignments }] =
      await Promise.all([
        supabase.from("programs").select("title").eq("id", programId).single(),
        supabase
          .from("program_exercises")
          .select("id, name, sets, reps, notes, order_index")
          .eq("program_id", programId)
          .order("order_index"),
        supabase.from("profiles").select("id, full_name").eq("role", "athlete"),
        supabase
          .from("program_assignments")
          .select("athlete_id")
          .eq("program_id", programId),
      ]);

    setTitle(program?.title ?? "");
    setExercises(exercisesData ?? []);
    setAllAthletes(athletes ?? []);
    setAssignedIds(new Set((assignments ?? []).map((a) => a.athlete_id)));
    setLoading(false);
  }, [programId, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function addExercise(e: React.FormEvent) {
    e.preventDefault();
    if (!exerciseName.trim()) return;

    await supabase.from("program_exercises").insert({
      program_id: programId,
      name: exerciseName,
      sets: sets === "" ? null : sets,
      reps: reps === "" ? null : reps,
      order_index: exercises.length,
    });

    setExerciseName("");
    setSets("");
    setReps("");
    loadData();
  }

  async function removeExercise(id: string) {
    await supabase.from("program_exercises").delete().eq("id", id);
    loadData();
  }

  async function toggleAssignment(athleteId: string, assigned: boolean) {
    if (assigned) {
      await supabase
        .from("program_assignments")
        .delete()
        .eq("program_id", programId)
        .eq("athlete_id", athleteId);
    } else {
      await supabase
        .from("program_assignments")
        .insert({ program_id: programId, athlete_id: athleteId });
    }
    loadData();
  }

  if (loading) {
    return (
      <main className="app-bg min-h-screen px-4 py-8 text-white">
        Chargement...
      </main>
    );
  }

  return (
    <main className="app-bg min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <a href="/coach" className="text-sm text-pink-300">
          ← Mes programmes
        </a>
        <h1 className="mb-6 mt-2 text-2xl font-bold text-white">{title}</h1>

        <section className="mb-10">
          <h2 className="mb-3 text-lg font-semibold text-white">Exercices</h2>

          <ul className="mb-4 space-y-2">
            {exercises.map((ex) => (
              <li
                key={ex.id}
                className="glass-card flex items-center justify-between px-3 py-2"
              >
                <span className="text-sm text-white/90">
                  {ex.name}
                  {ex.sets && ex.reps ? ` — ${ex.sets} x ${ex.reps}` : ""}
                </span>
                <button
                  onClick={() => removeExercise(ex.id)}
                  className="text-sm text-red-300 hover:underline"
                >
                  Retirer
                </button>
              </li>
            ))}
          </ul>

          <form onSubmit={addExercise} className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Nom de l'exercice"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="glass-input flex-1"
              required
            />
            <input
              type="number"
              placeholder="Séries"
              value={sets}
              onChange={(e) =>
                setSets(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="glass-input w-24"
            />
            <input
              type="number"
              placeholder="Répétitions"
              value={reps}
              onChange={(e) =>
                setReps(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="glass-input w-28"
            />
            <button
              type="submit"
              className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Ajouter
            </button>
          </form>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">
            Athlètes assignés
          </h2>

          {allAthletes.length === 0 ? (
            <p className="text-sm text-white/60">
              Aucun athlète n'a encore créé de compte.
            </p>
          ) : (
            <ul className="space-y-2">
              {allAthletes.map((athlete) => {
                const assigned = assignedIds.has(athlete.id);
                return (
                  <li
                    key={athlete.id}
                    className="glass-card flex items-center justify-between px-3 py-2"
                  >
                    <span className="text-sm text-white/90">
                      {athlete.full_name ?? "Sans nom"}
                    </span>
                    <button
                      onClick={() => toggleAssignment(athlete.id, assigned)}
                      className={`text-sm font-medium ${
                        assigned ? "text-red-300" : "text-pink-300"
                      }`}
                    >
                      {assigned ? "Retirer" : "Assigner"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
