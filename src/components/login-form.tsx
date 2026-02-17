"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      let email = username.trim();
      if (!email.includes("@")) {
        const response = await fetch("/api/auth/resolve-username", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: email }),
        });

        if (!response.ok) {
          setErrorMessage("Utilisateur introuvable.");
          return;
        }

        const data = await response.json();
        email = data.email;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full space-y-5">
      <div>
        <label htmlFor="username" className="mb-1.5 block text-xs font-bold text-zinc-700 uppercase tracking-wide">
          Utilisateur ou email
        </label>
        <input
          id="username"
          type="text"
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-amber-400 focus:shadow-md"
          placeholder="Votre identifiant"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-bold text-zinc-700 uppercase tracking-wide">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-amber-400 focus:shadow-md"
          placeholder="••••••••"
        />
      </div>

      {errorMessage ? (
        <p className="rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 font-semibold">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 px-6 py-3.5 text-base font-black text-white shadow-md transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
      >
        {isLoading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
