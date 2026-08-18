"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES } from "@/lib/categories";

type Athlete = {
  id: string;
  full_name: string | null;
  username: string | null;
  motivational_quote: string | null;
};

type Exercise = {
  id: string;
  name: string;
  sets: number | null;
  reps: number | null;
  notes: string | null;
  order_index: number;
};

type CategoryData = {
  programId: string | null;
  exercises: Exercise[];
};

export default function AdminAthleteEditor({
  athlete,
  adminId,
}: {
  athlete: Athlete;
  adminId: string;
}) {
  const supabase = createClient();

  const [quote, setQuote] = useState(athlete.motivational_quote ?? "");
  const [quoteSaving, setQuoteSaving] = useState(false);
  const [quoteSaved, setQuoteSaved] = useState(false);

  const [loading, setLoading] = useState(true);
  const [byCategory, setByCategory] = useState<Record<string, CategoryData>>(
    {}
  );

  const loadPrograms = useCallback(async () => {
    setLoading(true);

    const { data: assignments } = await supabase
      .from("program_assignments")
      .select("program_id")
      .eq("athlete_id", athlete.id);

    const programIds = (assignments ?? []).map((a) => a.program_id);

    const { data: programs } = programIds.length
      ? await supabase
          .from("programs")
          .select("id, category")
          .in("id", programIds)
      : { data: [] as { id: string; category: string | null }[] };

    const { data: exercisesData } = programIds.length
      ? await supabase
          .from("program_exercises")
          .select("id, program_id, name, sets, reps, notes, order_index")
          .in("program_id", programIds)
          .order("order_index")
      : { data: [] as (Exercise & { program_id: string })[] };

    const next: Record<string, CategoryData> = {};
    for (const cat of CATEGORIES) {
      const program = (programs ?? []).find((p) => p.category === cat.slug);
      next[cat.slug] = {
        programId: program?.id ?? null,
        exercises: program
          ? (exercisesData ?? []).filter((e) => e.program_id === program.id)
          : [],
      };
    }
    setByCategory(next);
    setLoading(false);
  }, [athlete.id, supabase]);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  async function saveQuote() {
    setQuoteSaving(true);
    await supabase
      .from("profiles")
      .update({ motivational_quote: quote || null })
      .eq("id", athlete.id);
    setQuoteSaving(false);
    setQuoteSaved(true);
    setTimeout(() => setQuoteSaved(false), 2000);
  }

  async function addExercise(
    categorySlug: string,
    exercise: { name: string; sets: number | ""; reps: number | ""; notes: string }
  ) {
    let programId = byCategory[categorySlug]?.programId ?? null;

    if (!programId) {
      const category = CATEGORIES.find((c) => c.slug === categorySlug)!;
      const { data: newProgram, error: programError } = await supabase
        .from("programs")
        .insert({
          coach_id: adminId,
          title: `${category.label} — ${athlete.full_name ?? athlete.username}`,
          category: categorySlug,
        })
        .select("id")
        .single();

      if (programError || !newProgram) {
        alert(
          "Impossible de créer le programme : " +
            (programError?.message ?? "erreur inconnue")
        );
        return;
      }
      programId = newProgram.id;

      const { error: assignError } = await supabase
        .from("program_assignments")
        .insert({ program_id: programId, athlete_id: athlete.id });

      if (assignError) {
        alert("Impossible d'assigner le programme : " + assignError.message);
        return;
      }
    }

    const { error: exerciseError } = await supabase
      .from("program_exercises")
      .insert({
        program_id: programId,
        name: exercise.name,
        sets: exercise.sets === "" ? null : exercise.sets,
        reps: exercise.reps === "" ? null : exercise.reps,
        notes: exercise.notes || null,
        order_index: byCategory[categorySlug]?.exercises.length ?? 0,
      });

    if (exerciseError) {
      alert("Impossible d'ajouter l'exercice : " + exerciseError.message);
      return;
    }

    loadPrograms();
  }

  async function removeExercise(exerciseId: string) {
    await supabase.from("program_exercises").delete().eq("id", exerciseId);
    loadPrograms();
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-2 text-lg font-semibold text-slate-900">
          Citation de motivation
        </h2>
        <p className="mb-3 text-sm text-slate-600">
          Affichée façon citation sur la page d'accueil de l'athlète.
        </p>
        <textarea
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          rows={3}
          placeholder="Ex : Chaque séance te rapproche de ton objectif."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          onClick={saveQuote}
          disabled={quoteSaving}
          className="mt-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {quoteSaving ? "Enregistrement..." : "Enregistrer"}
        </button>
        {quoteSaved && (
          <span className="ml-3 text-sm text-brand">Enregistré ✓</span>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Blocs d'entraînement
        </h2>

        {loading ? (
          <p className="text-slate-600">Chargement...</p>
        ) : (
          <div className="space-y-6">
            {CATEGORIES.map((cat) => (
              <CategoryBlock
                key={cat.slug}
                label={cat.label}
                data={byCategory[cat.slug]}
                onAdd={(exercise) => addExercise(cat.slug, exercise)}
                onRemove={removeExercise}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CategoryBlock({
  label,
  data,
  onAdd,
  onRemove,
}: {
  label: string;
  data: CategoryData | undefined;
  onAdd: (exercise: {
    name: string;
    sets: number | "";
    reps: number | "";
    notes: string;
  }) => void;
  onRemove: (exerciseId: string) => void;
}) {
  const [name, setName] = useState("");
  const [sets, setSets] = useState<number | "">("");
  const [reps, setReps] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name, sets, reps, notes });
    setName("");
    setSets("");
    setReps("");
    setNotes("");
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <h3 className="mb-3 font-medium text-slate-900">{label}</h3>

      {data && data.exercises.length > 0 ? (
        <ul className="mb-4 space-y-2">
          {data.exercises.map((ex) => (
            <li
              key={ex.id}
              className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2"
            >
              <span className="text-sm text-slate-800">
                {ex.name}
                {ex.sets && ex.reps ? ` — ${ex.sets} x ${ex.reps}` : ""}
                {ex.notes ? ` (${ex.notes})` : ""}
              </span>
              <button
                onClick={() => onRemove(ex.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Retirer
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-sm text-slate-500">
          Aucun exercice pour l'instant.
        </p>
      )}

      <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Nom de l'exercice"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-[140px] rounded-md border border-slate-300 px-3 py-2 text-sm"
          required
        />
        <input
          type="number"
          placeholder="Séries"
          value={sets}
          onChange={(e) =>
            setSets(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="w-20 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Répétitions"
          value={reps}
          onChange={(e) =>
            setReps(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="w-24 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Notes (optionnel)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="flex-1 min-w-[140px] rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          Ajouter
        </button>
      </form>
    </div>
  );
}
