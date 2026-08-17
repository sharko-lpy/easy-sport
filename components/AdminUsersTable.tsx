"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Role = "athlete" | "coach" | "admin";

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  role: Role;
  created_at: string;
};

export default function AdminUsersTable({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const supabase = createClient();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, username, full_name, role, created_at")
      .order("created_at", { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function changeRole(id: string, role: Role) {
    await supabase.from("profiles").update({ role }).eq("id", id);
    loadUsers();
  }

  async function deleteUser(id: string) {
    if (
      !confirm(
        "Supprimer ce compte ? Ses programmes/données associées seront aussi supprimés."
      )
    ) {
      return;
    }
    await supabase.from("profiles").delete().eq("id", id);
    loadUsers();
  }

  if (loading) {
    return <p className="text-slate-600">Chargement...</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-2 font-medium">Nom d'utilisateur</th>
            <th className="px-4 py-2 font-medium">Nom complet</th>
            <th className="px-4 py-2 font-medium">Rôle</th>
            <th className="px-4 py-2 font-medium">Créé le</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-slate-200">
              <td className="px-4 py-2 text-slate-900">
                {u.username ?? "—"}
              </td>
              <td className="px-4 py-2 text-slate-700">
                {u.full_name ?? "—"}
              </td>
              <td className="px-4 py-2">
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value as Role)}
                  disabled={u.id === currentUserId}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm disabled:opacity-50"
                >
                  <option value="athlete">Athlète</option>
                  <option value="coach">Coach</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="px-4 py-2 text-slate-500">
                {new Date(u.created_at).toLocaleDateString("fr-FR")}
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  onClick={() => deleteUser(u.id)}
                  disabled={u.id === currentUserId}
                  className="text-sm text-red-600 hover:underline disabled:opacity-50"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
