import { NextResponse } from "next/server";
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = String(body?.id ?? "").trim();

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
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

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}
