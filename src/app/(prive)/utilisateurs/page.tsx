import { redirect } from "next/navigation";
import { AdminUserForm } from "@/components/admin-user-form";
import { AdminUsersTable } from "@/components/admin-users-table";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export default async function UtilisateursPage() {
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
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: users } = await supabase
    .schema("app")
    .from("profiles")
    .select("id, nom_complet, username, role, created_at")
    .order("created_at", { ascending: false });

  let emailsById = new Map<string, string | null>();
  try {
    const adminClient = createAdminClient();
    const { data: listedUsers } = await adminClient.auth.admin.listUsers();
    emailsById = new Map(
      (listedUsers.users ?? []).map((item) => [item.id, item.email ?? null]),
    );
  } catch {
    // Si la clé service role n'est pas disponible, la page reste utilisable sans emails.
  }

  const mappedUsers = (users ?? []).map((item) => ({
    ...item,
    role: item.role,
    email: emailsById.get(item.id) ?? null,
  }));

  return (
    <div className="space-y-5 md:space-y-8">
      <div className="text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">Utilisateurs</h2>
        <p className="text-sm md:text-base text-zinc-600 mt-1">Gestion des accès employés et admin</p>
      </div>

      <AdminUserForm />

      <AdminUsersTable users={mappedUsers} currentUserId={user.id} />
    </div>
  );
}
