"use client";

import { useState } from "react";

function formatPrix(totalPrix: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(totalPrix);
}

export function WhatsAppNotifyButton({
  telephone,
  clientNom,
  totalPrix,
}: {
  telephone: string;
  clientNom: string;
  totalPrix: number;
}) {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const onSend = async () => {
    setError("");
    setSuccess(false);

    if (!telephone.trim()) {
      setError("Numero de telephone manquant.");
      return;
    }

    setIsSending(true);
    try {
      const prixMessage = totalPrix > 0 ? `au prix de ${formatPrix(totalPrix)} DH` : "gratuit";
      const message =
        `Bonjour ${clientNom},\n` +
        "Ben Daoud Bijouterie vous informe que votre article est pret. " +
        `Vous pouvez passer le recuperer ${prixMessage}.\n` +
        "Merci.\n" +
        "Ben Daoud Bijouterie";

      const response = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telephone: telephone.trim(), message }),
      });

      if (!response.ok) {
        throw new Error("Erreur envoi WhatsApp.");
      }

      setSuccess(true);
    } catch (err) {
      setError("Impossible d'envoyer la notification.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
      <button
        type="button"
        onClick={onSend}
        disabled={isSending}
        className="rounded-lg bg-emerald-600 px-4 py-2.5 sm:py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 w-full sm:w-auto"
      >
        {isSending ? "⏳ Envoi..." : "📱 Envoyer WhatsApp"}
      </button>
      {error ? (
        <span className="text-xs sm:text-sm text-red-600 px-2">{error}</span>
      ) : success ? (
        <span className="text-xs sm:text-sm text-emerald-700 px-2">✓ Message envoyé.</span>
      ) : null}
    </div>
  );
}
