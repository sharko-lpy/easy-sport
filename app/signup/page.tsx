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
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border border-slate-200 p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-slate-900">
          Créer un compte
        </h1>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Nom complet
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Nom d'utilisateur
          </label>
          <input
            type="text"
            required
            minLength={3}
            pattern="[A-Za-z0-9_.-]+"
            title="Lettres, chiffres, points, tirets et underscores uniquement"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Mot de passe
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Je suis...
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "athlete" | "coach")}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="athlete">Un athlète (je suis un programme)</option>
            <option value="coach">Un coach (je crée des programmes)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "Création..." : "Créer mon compte"}
        </button>

        <p className="text-center text-sm text-slate-600">
          Déjà un compte ?{" "}
          <a href="/login" className="font-medium text-brand">
            Se connecter
          </a>
        </p>
      </form>
    </main>
  );
}
