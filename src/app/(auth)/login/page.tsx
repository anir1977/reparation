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
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-black">Ben Daoud Réparation</h1>
        <p className="mt-1 text-sm text-zinc-600">Connexion à l’espace interne</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
