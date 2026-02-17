"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type CreateUserActionState = {
  ok: boolean;
  message: string;
};

export type AdminUserMutationState = {
  ok: boolean;
  message: string;
};

const INITIAL_ERROR_STATE: AdminUserMutationState = {
  ok: false,
  message: "Action impossible.",
};

type AdminContextResult =
  | { ok: false; error: string }
  | { ok: true; userId: string };

async function assertAdminContext(): Promise<AdminContextResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Session expirée." };
  }

  const { data: profile } = await supabase
    .schema("app")
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { ok: false, error: "Action réservée aux administrateurs." };
  }

  return { ok: true, userId: user.id };
}

export async function createUserByAdminAction(
  _prevState: CreateUserActionState,
  formData: FormData,
): Promise<CreateUserActionState> {
  const nomComplet = String(formData.get("nom_complet") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  const role = String(formData.get("role") ?? "employe").trim();

  if (!nomComplet || !username || !email || !password) {
    return { ok: false, message: "Nom, utilisateur, email et mot de passe sont obligatoires." };
  }

  if (password.length < 6) {
    return { ok: false, message: "Le mot de passe doit contenir au moins 6 caractères." };
  }

  if (role !== "admin" && role !== "employe") {
    return { ok: false, message: "Rôle invalide." };
  }

  const adminContext = await assertAdminContext();
  if (!adminContext.ok) {
    return { ok: false, message: adminContext.error };
  }

  const adminClient = createAdminClient();

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nom_complet: nomComplet },
    app_metadata: { role },
  });

  if (createError || !created.user) {
    return { ok: false, message: createError?.message ?? "Erreur de création utilisateur." };
  }

  const { error: upsertError } = await adminClient
    .schema("app")
    .from("profiles")
    .upsert(
      {
        id: created.user.id,
        nom_complet: nomComplet,
        username,
        email,
        role,
      },
      { onConflict: "id" },
    );

  if (upsertError) {
    return { ok: false, message: upsertError.message };
  }

  revalidatePath("/utilisateurs");

  return { ok: true, message: "Utilisateur créé avec succès." };
}

export async function updateUserByAdminAction(
  _prevState: AdminUserMutationState,
  formData: FormData,
): Promise<AdminUserMutationState> {
  const targetUserId = String(formData.get("user_id") ?? "").trim();
  const nomComplet = String(formData.get("nom_complet") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();

  if (!targetUserId || !nomComplet || !username) {
    return INITIAL_ERROR_STATE;
  }

  if (role !== "admin" && role !== "employe") {
    return { ok: false, message: "Rôle invalide." };
  }

  const adminContext = await assertAdminContext();
  if (!adminContext.ok) {
    return { ok: false, message: adminContext.error };
  }

  if (targetUserId === adminContext.userId && role !== "admin") {
    return { ok: false, message: "Impossible de retirer votre propre rôle admin." };
  }

  if (password && password.length < 6) {
    return { ok: false, message: "Le mot de passe doit contenir au moins 6 caractères." };
  }

  const adminClient = createAdminClient();

  const { data: authUser, error: getUserError } = await adminClient.auth.admin.getUserById(
    targetUserId,
  );

  if (getUserError) {
    return { ok: false, message: getUserError.message };
  }

  const { error: updateAuthError } = await adminClient.auth.admin.updateUserById(targetUserId, {
    user_metadata: { nom_complet: nomComplet },
    app_metadata: { role },
    ...(password ? { password } : {}),
  });

  if (updateAuthError) {
    return { ok: false, message: updateAuthError.message };
  }

  const { error: updateProfileError } = await adminClient
    .schema("app")
    .from("profiles")
    .update({ nom_complet: nomComplet, username, role, email: authUser?.user?.email ?? null })
    .eq("id", targetUserId);

  if (updateProfileError) {
    return { ok: false, message: updateProfileError.message };
  }

  revalidatePath("/utilisateurs");

  return { ok: true, message: "Utilisateur mis à jour." };
}

export async function deleteUserByAdminAction(
  _prevState: AdminUserMutationState,
  formData: FormData,
): Promise<AdminUserMutationState> {
  const targetUserId = String(formData.get("user_id") ?? "").trim();

  if (!targetUserId) {
    return INITIAL_ERROR_STATE;
  }

  const adminContext = await assertAdminContext();
  if (!adminContext.ok) {
    return { ok: false, message: adminContext.error };
  }

  if (targetUserId === adminContext.userId) {
    return { ok: false, message: "Impossible de supprimer votre propre compte." };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(targetUserId);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/utilisateurs");

  return { ok: true, message: "Utilisateur supprimé." };
}
