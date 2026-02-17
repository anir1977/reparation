"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  const onLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={onLogout}
      className="rounded-lg border border-amber-200 px-3 py-2 text-sm font-medium text-black transition hover:bg-amber-50"
    >
      Déconnexion
    </button>
  );
}
