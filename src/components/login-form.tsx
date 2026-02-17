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
    <form onSubmit={onSubmit} className="w-full space-y-4">
      <div>
        <label htmlFor="username" className="mb-1 block text-sm font-medium">
          Utilisateur ou email
        </label>
        <input
          id="username"
          type="text"
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none transition focus:border-amber-400"
          placeholder="utilisateur ou email"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 outline-none transition focus:border-amber-400"
          placeholder="••••••••"
        />
      </div>

      {errorMessage ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-black px-4 py-2 font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60"
      >
        {isLoading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
