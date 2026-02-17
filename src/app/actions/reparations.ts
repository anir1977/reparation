"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const PATHS_TO_REVALIDATE = [
  "/dashboard",
  "/reparations-en-cours",
  "/reparations-pretes",
  "/historique",
  "/statistiques",
  "/nouvelle-reparation",
];

export async function deleteReparationAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return;
  }

  const supabase = await createClient();

  const { data: bijoux } = await supabase
    .schema("app")
    .from("bijoux")
    .select("id")
    .eq("reparation_id", id);

  const bijouIds = (bijoux ?? []).map((item) => item.id);

  if (bijouIds.length) {
    const { data: photoRows } = await supabase
      .schema("app")
      .from("bijou_photos")
      .select("storage_path")
      .in("bijou_id", bijouIds);

    const paths = (photoRows ?? []).map((item) => item.storage_path);

    if (paths.length) {
      await supabase.storage.from("bijoux-photos").remove(paths);
    }
  }

  await supabase.schema("app").from("reparations").delete().eq("id", id);

  PATHS_TO_REVALIDATE.forEach((path) => revalidatePath(path));
}
