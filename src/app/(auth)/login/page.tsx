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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-white to-zinc-50 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border-2 border-amber-100 bg-white p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-4 mb-8">
          <img 
            src="/logo.jpg" 
            alt="Ben Daoud Logo"
            className="h-20 w-20 rounded-2xl object-cover shadow-lg"
          />
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900">Ben Daoud Réparation</h1>
            <p className="text-sm md:text-base text-zinc-600 mt-1 font-medium">Connexion à l'espace interne</p>
          </div>
        </div>
        <div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
