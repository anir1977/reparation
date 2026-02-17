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
    <article className="rounded-2xl border-2 border-zinc-100 bg-gradient-to-br from-white to-zinc-50 p-5 shadow-md hover:shadow-lg transition-shadow">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-xl bg-zinc-100 p-2.5">
          <UserCircleIcon className="h-6 w-6 text-zinc-600 flex-shrink-0" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <EnvelopeIcon className="h-4 w-4 text-zinc-400" />
            <p className="text-sm text-zinc-700 truncate font-semibold">{item.email ?? "Email indisponible"}</p>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-zinc-400" />
            <p className="text-xs text-zinc-500 font-medium">
              Créé le {new Date(item.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <form action={updateAction} className="space-y-3">
        <input type="hidden" name="user_id" value={item.id} />
        
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1.5 uppercase tracking-wide">Nom complet</label>
          <input
            name="nom_complet"
            defaultValue={item.nom_complet ?? ""}
            required
            className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-amber-400 focus:shadow-md"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1.5 uppercase tracking-wide">Nom d'utilisateur</label>
          <input
            name="username"
            defaultValue={item.username ?? ""}
            required
            className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-amber-400 focus:shadow-md"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1.5 uppercase tracking-wide">Rôle</label>
          <select
            name="role"
            defaultValue={item.role}
            className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-amber-400 focus:shadow-md"
            disabled={isSelf}
          >
            <option value="employe">Employé</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {isSelf && (
          <div className="rounded-xl bg-amber-50 border-2 border-amber-200 px-3 py-2">
            <p className="text-xs text-amber-700 font-bold">⚠️ Votre compte (modification désactivée)</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isUpdating || isSelf}
            className="flex-1 rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-sm font-black text-amber-900 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md uppercase tracking-wide"
          >
            {isUpdating ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>

        <MutationMessage state={updateState} />
      </form>

      <form action={deleteAction} className="mt-4 pt-4 border-t-2 border-zinc-100">
        <input type="hidden" name="user_id" value={item.id} />
        <button
          type="submit"
          disabled={isDeleting || isSelf}
          className="w-full rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md uppercase tracking-wide"
        >
          {isDeleting ? "Suppression..." : "Supprimer"}
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
    <section className="rounded-2xl border-2 border-zinc-100 bg-white p-4 md:p-6 shadow-lg">
      <h3 className="mb-5 text-lg md:text-xl font-bold text-zinc-900">Liste des utilisateurs</h3>

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
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-12 text-center">
            <p className="text-zinc-500 font-bold text-base">Aucun utilisateur</p>
            <p className="text-sm text-zinc-400 mt-1">Créez un nouvel utilisateur</p>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b-2 border-zinc-200 text-left text-zinc-700 font-bold">
              <th className="px-3 py-3">Nom / Utilisateur / Email</th>
              <th className="px-3 py-3">Rôle</th>
              <th className="px-3 py-3">Créé le</th>
              <th className="px-3 py-3">Suppression</th>
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
                <td colSpan={4} className="px-3 py-8 text-center text-zinc-500">
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
