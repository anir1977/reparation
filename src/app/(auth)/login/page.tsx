import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-white to-zinc-50 px-3 sm:px-4">
      <div className="w-full max-w-md rounded-xl sm:rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black border-2 border-amber-700 shadow flex-shrink-0">
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{letterSpacing: '0.01em', color:'#facc15'}}>
              BD
            </span>
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-black">Ben Daoud Réparation</h1>
            <p className="text-xs sm:text-sm text-zinc-600">Connexion à l'espace interne</p>
          </div>
        </div>
        <div className="mt-5 sm:mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
