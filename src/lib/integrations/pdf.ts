
import { jsPDF } from "jspdf";
import type { Reparation } from "@/lib/types";
// Génère une attestation de dépôt PDF avec liste des articles et mention légale
export function genererAttestationDepot({ client, bijoux }: { client: { nom_complet: string; telephone?: string }, bijoux: { type_produit: string; description?: string }[] }) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("Attestation de dépôt d'articles", 10, 15);
  doc.setFontSize(11);
  doc.text(`Client : ${client.nom_complet}`, 10, 30);
  if (client.telephone) doc.text(`Téléphone : ${client.telephone}`, 10, 38);
  doc.text("Articles laissés :", 10, 50);
  bijoux.forEach((bijou, i) => {
    doc.text(`- ${bijou.type_produit} : ${bijou.description || "(aucune description)"}`, 15, 60 + i * 8);
  });
  doc.setFontSize(10);
  doc.text(
    "\n\nEn cas de perte de cette attestation, une déclaration de perte est obligatoire.",
    10,
    80 + bijoux.length * 8
  );
  doc.save("attestation-depot.pdf");
}

export interface PdfInvoicePayload {
  reparation: Reparation;
  clientNom: string;
  bijouxCount: number;
}

export async function genererFacturePdf(_payload: PdfInvoicePayload) {
  void _payload;
  throw new Error("Génération PDF non implémentée. Structure prête pour intégration.");
}
