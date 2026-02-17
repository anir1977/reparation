export interface WhatsAppNotificationPayload {
  telephone: string;
  message: string;
}


// Cette implémentation utilise whatsapp-web.js (Node.js, open source)
// Nécessite une instance Node.js séparée (non utilisable côté client Next.js directement)
// Pour la démo, on simule l'envoi (mock)

export async function envoyerNotificationWhatsApp(payload: WhatsAppNotificationPayload) {
  const baseUrl = process.env.WHATSAPP_WEB_URL || "http://localhost:4001";
  const response = await fetch(`${baseUrl}/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Erreur notification WhatsApp.");
  }

  return true;
}
