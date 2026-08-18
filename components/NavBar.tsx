"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NavBar({
  fullName,
  role,
}: {
  fullName?: string | null;
  role?: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-[#1a0b2e]/90 px-6 py-4 backdrop-blur-md">
      <a href="/dashboard" className="font-semibold text-white">
        Coaching Sportif
      </a>
      <div className="flex items-center gap-4">
        {role === "admin" && (
          <a
            href="/admin"
            className="text-sm font-medium text-pink-300 hover:underline"
          >
            Admin
          </a>
        )}
        {role === "athlete" && (
          <a
            href="/historique"
            className="text-sm font-medium text-pink-300 hover:underline"
          >
            Historique
          </a>
        )}
        {fullName && (
          <span className="text-sm text-white/70">Bonjour {fullName}</span>
        )}
        <button
          onClick={handleLogout}
          className="rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
        >
          Se déconnecter
        </button>
      </div>
    </header>
  );
}
