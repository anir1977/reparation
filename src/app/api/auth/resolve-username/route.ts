import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = String(body?.username ?? "").trim().toLowerCase();

    if (!username) {
      return NextResponse.json({ error: "Utilisateur requis." }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .schema("app")
      .from("profiles")
      .select("email")
      .eq("username", username)
      .maybeSingle();

    if (error || !data?.email) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    return NextResponse.json({ email: data.email });
  } catch (error: any) {
    const message = error?.message || "Erreur serveur.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
