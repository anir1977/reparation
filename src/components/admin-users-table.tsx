"use client";

import { useActionState } from "react";
import {
  deleteUserByAdminAction,
  type AdminUserMutationState,
  updateUserByAdminAction,
} from "@/app/actions/admin-users";

type UserRowItem = {
  id: string;
  nom_complet: string | null;
  username: string | null;
  role: "admin" | "employe";
  created_at: string;
  email: string | null;
};

const INITIAL_STATE: AdminUserMutationState = {
  ok: false,
  message: "",
};

function MutationMessage({ state }: { state: AdminUserMutationState }) {
  if (!state.message) return null;

  return (
    <p
      className={`mt-2 rounded-lg px-2 py-1 text-xs ${
        state.ok
          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {state.message}
    </p>
  );
}

function AdminUserEditableRow({
  item,
  isSelf,
}: {
  item: UserRowItem;
  isSelf: boolean;
}) {
  const [updateState, updateAction, isUpdating] = useActionState(
    updateUserByAdminAction,
    INITIAL_STATE,
  );
  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteUserByAdminAction,
    INITIAL_STATE,
  );

  return (
    <tr className="border-b border-zinc-100 align-top">
      <td className="px-2 py-3">
        <p className="text-xs text-zinc-500">{item.email ?? "Email indisponible"}</p>
      </td>

      <td className="px-2 py-3">
        <form action={updateAction} className="space-y-2">
          <input type="hidden" name="user_id" value={item.id} />
          <input
            name="nom_complet"
            defaultValue={item.nom_complet ?? ""}
            required
            className="w-full rounded-md border border-zinc-200 px-2 py-1.5 text-sm outline-none transition focus:border-amber-400"
          />
          <input
            name="username"
            defaultValue={item.username ?? ""}
            required
            className="w-full rounded-md border border-zinc-200 px-2 py-1.5 text-sm outline-none transition focus:border-amber-400"
          />

          <div className="flex items-center gap-2">
            <select
              name="role"
              defaultValue={item.role}
              className="rounded-md border border-zinc-200 px-2 py-1.5 text-sm outline-none transition focus:border-amber-400"
              disabled={isSelf}
            >
              <option value="employe">Employé</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={isUpdating || isSelf}
              className="rounded-md border border-zinc-200 px-2 py-1.5 text-xs font-medium transition hover:border-amber-300 disabled:opacity-60"
            >
              {isUpdating ? "En cours..." : "Sauver"}
            </button>
          </div>

          <MutationMessage state={updateState} />
        </form>
        {isSelf ? <p className="mt-1 text-xs text-zinc-500">Votre compte</p> : null}
      </td>

      <td className="px-2 py-3">{new Date(item.created_at).toLocaleDateString("fr-FR")}</td>

      <td className="px-2 py-3">
        <form action={deleteAction}>
          <input type="hidden" name="user_id" value={item.id} />
          <button
            type="submit"
            disabled={isDeleting || isSelf}
            className="rounded-md border border-red-200 px-2 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </button>
          <MutationMessage state={deleteState} />
        </form>
      </td>
    </tr>
  );
}

export function AdminUsersTable({
  users,
  currentUserId,
}: {
  users: UserRowItem[];
  currentUserId: string;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Liste des utilisateurs</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-600">
              <th className="px-2 py-2">Nom / Utilisateur / Email</th>
              <th className="px-2 py-2">Rôle</th>
              <th className="px-2 py-2">Créé le</th>
              <th className="px-2 py-2">Suppression</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <AdminUserEditableRow
                key={item.id}
                item={item}
                isSelf={item.id === currentUserId}
              />
            ))}
            {!users.length ? (
              <tr>
                <td colSpan={4} className="px-2 py-6 text-center text-zinc-500">
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
