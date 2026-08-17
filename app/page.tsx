import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold text-slate-900">
        Coaching sportif, simplifié
      </h1>
      <p className="max-w-md text-slate-600">
        Crée des programmes d'entraînement, assigne-les à tes athlètes,
        et suis leur progression séance après séance.
      </p>
      <div className="flex gap-3">
        <a
          href="/login"
          className="rounded-md bg-brand px-5 py-2.5 font-medium text-white hover:bg-brand-dark"
        >
          Se connecter
        </a>
        <a
          href="/signup"
          className="rounded-md border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
        >
          Créer un compte
        </a>
      </div>
    </main>
  );
}
