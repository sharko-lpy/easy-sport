"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Exercise = {
  id: string;
  name: string;
  sets: number | null;
  reps: number | null;
  notes: string | null;
};

type LogEntry = {
  id: string;
  program_exercise_id: string;
  performed_at: string;
  sets_completed: number | null;
  reps_completed: number | null;
  weight_kg: number | null;
};

export default function AthleteProgramPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const programId = params.id;

  const [title, setTitle] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [openExerciseId, setOpenExerciseId] = useState<string | null>(null);
  const [setsCompleted, setSetsCompleted] = useState<number | "">("");
  const [repsCompleted, setRepsCompleted] = useState<number | "">("");
  const [weightKg, setWeightKg] = useState<number | "">("");

  const loadData = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const [{ data: program }, { data: exercisesData }, { data: logsData }] =
      await Promise.all([
        supabase.from("programs").select("title").eq("id", programId).single(),
        supabase
          .from("program_exercises")
          .select("id, name, sets, reps, notes")
          .eq("program_id", programId)
          .order("order_index"),
        user
          ? supabase
              .from("workout_logs")
              .select("id, program_exercise_id, performed_at, sets_completed, reps_completed, weight_kg")
              .eq("athlete_id", user.id)
              .order("performed_at", { ascending: false })
              .limit(20)
          : Promise.resolve({ data: [] as LogEntry[] }),
      ]);

    setTitle(program?.title ?? "");
    setExercises(exercisesData ?? []);
    setLogs(logsData ?? []);
    setLoading(false);
  }, [programId, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function logWorkout(exerciseId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("workout_logs").insert({
      program_exercise_id: exerciseId,
      athlete_id: user.id,
      sets_completed: setsCompleted === "" ? null : setsCompleted,
      reps_completed: repsCompleted === "" ? null : repsCompleted,
      weight_kg: weightKg === "" ? null : weightKg,
    });

    setOpenExerciseId(null);
    setSetsCompleted("");
    setRepsCompleted("");
    setWeightKg("");
    loadData();
  }

  if (loading) {
    return <main className="mx-auto max-w-3xl px-4 py-8">Chargement...</main>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <a href="/programs/liste" className="text-sm text-brand">
        ← Mes programmes
      </a>
      <h1 className="mb-6 mt-2 text-2xl font-bold text-slate-900">{title}</h1>

      <ul className="space-y-3">
        {exercises.map((ex) => {
          const isOpen = openExerciseId === ex.id;
          const lastLog = logs.find((l) => l.program_exercise_id === ex.id);

          return (
            <li
              key={ex.id}
              className="rounded-lg border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{ex.name}</p>
                  {ex.sets && ex.reps && (
                    <p className="text-sm text-slate-600">
                      Objectif : {ex.sets} x {ex.reps}
                    </p>
                  )}
                  {lastLog && (
                    <p className="text-xs text-slate-500">
                      Dernier passage : {lastLog.sets_completed ?? "-"} x{" "}
                      {lastLog.reps_completed ?? "-"}
                      {lastLog.weight_kg ? ` @ ${lastLog.weight_kg}kg` : ""}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setOpenExerciseId(isOpen ? null : ex.id)}
                  className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
                >
                  {isOpen ? "Annuler" : "Enregistrer"}
                </button>
              </div>

              {isOpen && (
                <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-slate-100 pt-3">
                  <div>
                    <label className="block text-xs text-slate-600">
                      Séries
                    </label>
                    <input
                      type="number"
                      value={setsCompleted}
                      onChange={(e) =>
                        setSetsCompleted(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600">
                      Répétitions
                    </label>
                    <input
                      type="number"
                      value={repsCompleted}
                      onChange={(e) =>
                        setRepsCompleted(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600">
                      Poids (kg)
                    </label>
                    <input
                      type="number"
                      value={weightKg}
                      onChange={(e) =>
                        setWeightKg(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => logWorkout(ex.id)}
                    className="rounded-md border border-brand px-3 py-1.5 text-sm font-medium text-brand hover:bg-brand hover:text-white"
                  >
                    Valider
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
