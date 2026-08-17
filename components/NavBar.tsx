"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NavBar({ fullName }: { fullName?: string | null }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
      <a href="/dashboard" className="font-semibold text-slate-900">
        Coaching Sportif
      </a>
      <div className="flex items-center gap-4">
        {fullName && (
          <span className="text-sm text-slate-600">Bonjour {fullName}</span>
        )}
        <button
          onClick={handleLogout}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          Se déconnecter
        </button>
      </div>
    </header>
  );
}
