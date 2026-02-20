import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .schema("app")
    .from("profiles")
    .select("nom_complet, role")
    .eq("id", user.id)
    .maybeSingle();

  const { count: urgentCount } = await supabase
    .schema("app")
    .from("reparations")
    .select("id", { count: "exact", head: true })
    .eq("urgent", true)
    .neq("statut", "livré");

  return (
    <AppShell
      role={profile?.role ?? "employe"}
      userName={profile?.nom_complet ?? user.email ?? "Employé"}
      urgentCount={urgentCount ?? 0}
    >
      {children}
    </AppShell>
  );
}
