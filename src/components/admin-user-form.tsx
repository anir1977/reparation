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
    <section className="rounded-xl sm:rounded-2xl border border-zinc-200 bg-white p-3 sm:p-5 shadow-sm">
      <h3 className="text-base sm:text-lg font-semibold">Créer un utilisateur</h3>
      <p className="mt-1 text-xs sm:text-sm text-zinc-600">Accès réservé aux administrateurs</p>

      <form ref={formRef} action={formAction} className="mt-4 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="nom_complet" className="mb-1 block text-xs sm:text-sm font-medium">
            Nom complet
          </label>
          <input
            id="nom_complet"
            name="nom_complet"
            required
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-amber-400"
          />
        </div>

        <div>
          <label htmlFor="username" className="mb-1 block text-xs sm:text-sm font-medium">
            Utilisateur
          </label>
          <input
            id="username"
            name="username"
            required
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-amber-400"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-xs sm:text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-amber-400"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-xs sm:text-sm font-medium">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-amber-400"
          />
        </div>

        <div>
          <label htmlFor="role" className="mb-1 block text-xs sm:text-sm font-medium">
            Rôle
          </label>
          <select
            id="role"
            name="role"
            defaultValue="employe"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none transition focus:border-amber-400"
          >
            <option value="employe">Employé</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="md:col-span-2">
          {state.message ? (
            <p
              className={`rounded-lg px-3 py-2 text-xs sm:text-sm ${
                state.ok
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-red-200 bg-red-50 text-red-700"
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
            className="w-full sm:w-auto rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60"
          >
            {isPending ? "Création..." : "Créer l'utilisateur"}
          </button>
        </div>
      </form>
    </section>
  );
}
