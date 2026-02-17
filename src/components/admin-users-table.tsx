"use client";

import { useActionState } from "react";
import {
  deleteUserByAdminAction,
  type AdminUserMutationState,
  updateUserByAdminAction,
} from "@/app/actions/admin-users";
import { UserCircleIcon, EnvelopeIcon, CalendarIcon } from "@heroicons/react/24/outline";

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

function AdminUserEditableCard({
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
    <article className="rounded-xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50/30 p-4 shadow-sm">
      <div className="mb-3 flex items-start gap-2">
        <UserCircleIcon className="h-6 w-6 text-zinc-400 flex-shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <EnvelopeIcon className="h-3.5 w-3.5 text-zinc-400" />
            <p className="text-xs text-zinc-600 truncate">{item.email ?? "Email indisponible"}</p>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-3.5 w-3.5 text-zinc-400" />
            <p className="text-xs text-zinc-500">
              Créé le {new Date(item.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
      </div>

      <form action={updateAction} className="space-y-3">
        <input type="hidden" name="user_id" value={item.id} />
        
        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Nom complet</label>
          <input
            name="nom_complet"
            defaultValue={item.nom_complet ?? ""}
            required
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-amber-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Nom d'utilisateur</label>
          <input
            name="username"
            defaultValue={item.username ?? ""}
            required
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-amber-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1">Rôle</label>
          <select
            name="role"
            defaultValue={item.role}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-amber-400"
            disabled={isSelf}
          >
            <option value="employe">Employé</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {isSelf && <p className="text-xs text-amber-600 font-medium">⚠️ Votre compte</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isUpdating || isSelf}
            className="flex-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 transition active:bg-amber-100 disabled:opacity-60"
          >
            {isUpdating ? "En cours..." : "Sauvegarder"}
          </button>
        </div>

        <MutationMessage state={updateState} />
      </form>

      <form action={deleteAction} className="mt-3 pt-3 border-t border-zinc-200">
        <input type="hidden" name="user_id" value={item.id} />
        <button
          type="submit"
          disabled={isDeleting || isSelf}
          className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition active:bg-red-100 disabled:opacity-60"
        >
          {isDeleting ? "Suppression..." : "Supprimer l'utilisateur"}
        </button>
        <MutationMessage state={deleteState} />
      </form>
    </article>
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
    <section className="rounded-2xl border border-zinc-200 bg-white p-3 sm:p-5 shadow-sm">
      <h3 className="mb-4 text-base sm:text-lg font-semibold">Liste des utilisateurs</h3>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {users.length ? (
          users.map((item) => (
            <AdminUserEditableCard
              key={item.id}
              item={item}
              isSelf={item.id === currentUserId}
            />
          ))
        ) : (
          <p className="text-center py-8 text-zinc-500 text-sm">Aucun utilisateur trouvé.</p>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
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
