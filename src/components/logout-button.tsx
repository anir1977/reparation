"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

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
      className="inline-flex items-center gap-2 rounded-xl border-2 border-amber-200 bg-white px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-bold text-zinc-900 shadow-sm transition-all hover:bg-amber-50 hover:border-amber-300 hover:shadow-md active:scale-95"
    >
      <ArrowRightOnRectangleIcon className="h-4 w-4 md:h-5 md:w-5 text-amber-700" />
      <span className="hidden md:inline">Déconnexion</span>
    </button>
  );
}
