"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewProgramPage() {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Tu dois être connecté.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("programs")
      .insert({ title, description, coach_id: user.id })
      .select("id")
      .single();

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(`/coach/programs/${data.id}`);
  }

  return (
    <main className="app-bg min-h-screen px-4 py-8">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-2xl font-bold text-white">
          Nouveau programme
        </h1>

        <form onSubmit={handleSubmit} className="glass-card space-y-4 p-6">
          {error && (
            <p className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          <div className="space-y-1">
            <label className="glass-label">Titre</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input"
              placeholder="Ex: Prise de masse - 8 semaines"
            />
          </div>

          <div className="space-y-1">
            <label className="glass-label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="glass-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "Création..." : "Créer le programme"}
          </button>
        </form>
      </div>
    </main>
  );
}
