import { NextRequest, NextResponse } from "next/server";
import { envoyerNotificationWhatsApp } from "@/lib/integrations/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { telephone, message } = body;
    if (!telephone || !message) {
      return NextResponse.json({ error: "Téléphone et message requis." }, { status: 400 });
    }
    await envoyerNotificationWhatsApp({ telephone, message });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur notification WhatsApp." }, { status: 500 });
  }
}
