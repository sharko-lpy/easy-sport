"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className={
        className ??
        "rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur hover:bg-white/20"
      }
    >
      Se déconnecter
    </button>
  );
}
