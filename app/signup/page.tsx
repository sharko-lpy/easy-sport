"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { usernameToEmail } from "@/lib/username";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"athlete" | "coach">("athlete");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email: usernameToEmail(username),
      password,
      options: {
        data: { full_name: fullName, username, role },
      },
    });

    setLoading(false);

    if (error) {
      setError(
        error.message.toLowerCase().includes("already registered")
          ? "Ce nom d'utilisateur est déjà pris."
          : error.message
      );
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="app-bg flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="glass-card w-full max-w-sm space-y-4 p-6"
      >
        <h1 className="text-xl font-semibold text-white">Créer un compte</h1>

        {error && (
          <p className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="space-y-1">
          <label className="glass-label">Nom complet</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="glass-input"
          />
        </div>

        <div className="space-y-1">
          <label className="glass-label">Nom d'utilisateur</label>
          <input
            type="text"
            required
            minLength={3}
            pattern="[A-Za-z0-9_.-]+"
            title="Lettres, chiffres, points, tirets et underscores uniquement"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="glass-input"
          />
        </div>

        <div className="space-y-1">
          <label className="glass-label">Mot de passe</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="glass-input"
          />
        </div>

        <div className="space-y-1">
          <label className="glass-label">Je suis...</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "athlete" | "coach")}
            className="glass-input"
          >
            <option className="text-slate-900" value="athlete">
              Un athlète (je suis un programme)
            </option>
            <option className="text-slate-900" value="coach">
              Un coach (je crée des programmes)
            </option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "Création..." : "Créer mon compte"}
        </button>

        <p className="text-center text-sm text-white/60">
          Déjà un compte ?{" "}
          <a href="/login" className="font-medium text-pink-300">
            Se connecter
          </a>
        </p>
      </form>
    </main>
  );
}
