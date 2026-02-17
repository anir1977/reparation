"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createUserByAdminAction,
  type CreateUserActionState,
} from "@/app/actions/admin-users";

const INITIAL_STATE: CreateUserActionState = {
  ok: false,
  message: "",
};

export function AdminUserForm() {
  const [state, formAction, isPending] = useActionState(createUserByAdminAction, INITIAL_STATE);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  return (
    <section className="rounded-2xl border-2 border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5 md:p-6 shadow-lg">
      <h3 className="text-lg md:text-xl font-bold text-zinc-900">Créer un utilisateur</h3>
      <p className="mt-1 text-sm text-zinc-600">Accès réservé aux administrateurs</p>

      <form ref={formRef} action={formAction} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="nom_complet" className="mb-1.5 block text-xs font-bold text-zinc-700 uppercase tracking-wide">
            Nom complet
          </label>
          <input
            id="nom_complet"
            name="nom_complet"
            required
            className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-amber-400 focus:shadow-md"
          />
        </div>

        <div>
          <label htmlFor="username" className="mb-1.5 block text-xs font-bold text-zinc-700 uppercase tracking-wide">
            Utilisateur
          </label>
          <input
            id="username"
            name="username"
            required
            className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-amber-400 focus:shadow-md"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-bold text-zinc-700 uppercase tracking-wide">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-amber-400 focus:shadow-md"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-bold text-zinc-700 uppercase tracking-wide">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-amber-400 focus:shadow-md"
          />
        </div>

        <div>
          <label htmlFor="role" className="mb-1.5 block text-xs font-bold text-zinc-700 uppercase tracking-wide">
            Rôle
          </label>
          <select
            id="role"
            name="role"
            defaultValue="employe"
            className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium outline-none transition-all focus:border-amber-400 focus:shadow-md"
          >
            <option value="employe">Employé</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="md:col-span-2">
          {state.message ? (
            <p
              className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                state.ok
                  ? "border-2 border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-2 border-red-300 bg-red-50 text-red-700"
              }`}
            >
              {state.message}
            </p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 px-6 py-3 text-sm font-black text-white shadow-md transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
          >
            {isPending ? "Création..." : "Créer l'utilisateur"}
          </button>
        </div>
      </form>
    </section>
  );
}
