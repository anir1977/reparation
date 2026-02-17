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
      className="rounded-lg border border-amber-200 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-black transition hover:bg-amber-50 active:bg-amber-100"
    >
      <span className="hidden sm:inline">Déconnexion</span>
      <span className="sm:hidden">🚪</span>
    </button>
  );
}
