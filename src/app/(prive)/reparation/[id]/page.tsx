import { notFound } from "next/navigation";
import { getReparationForEdit } from "@/lib/reparations";
import { WhatsAppNotifyButton } from "@/components/whatsapp-notify-button";
import { BijouPhotosDisplay } from "@/components/bijou-photos-display";

function formatDate(dateValue: string | null) {
  if (!dateValue) return "—";
  return new Date(dateValue).toLocaleDateString("fr-FR");
}

function formatPrix(value: string) {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(numeric);
}

export default async function ReparationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getReparationForEdit(id);

  if (!data) {
    notFound();
  }

  const totalPrix = data.bijoux.reduce(
    (sum, item) => sum + Number(item.prix_reparation || 0),
    0,
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">Fiche réparation</h2>
        <p className="text-xs sm:text-sm text-zinc-600">Consultation des détails client et bijoux</p>
      </div>

      <section className="rounded-xl sm:rounded-2xl border border-zinc-200 bg-white p-3 sm:p-5 shadow-sm">
        <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold">Client</h3>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs sm:text-sm text-zinc-500">Nom</p>
            <p className="text-sm sm:text-base font-medium text-zinc-900">{data.client.nom_complet}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-zinc-500">Téléphone</p>
            <p className="text-sm sm:text-base font-medium text-zinc-900">{data.client.telephone || "—"}</p>
          </div>
        </div>
        <div className="mt-3 sm:mt-4">
          <WhatsAppNotifyButton
            telephone={data.client.telephone || ""}
            clientNom={data.client.nom_complet}
            totalPrix={totalPrix}
          />
        </div>
      </section>

      <section className="rounded-xl sm:rounded-2xl border border-zinc-200 bg-white p-3 sm:p-5 shadow-sm">
        <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold">Détails réparation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs sm:text-sm text-zinc-500">Atelier</p>
            <p className="text-sm sm:text-base font-medium text-zinc-900">{data.atelier}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-zinc-500">Réception</p>
            <p className="text-sm sm:text-base font-medium text-zinc-900">{formatDate(data.date_reception_client)}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-zinc-500">Retour atelier</p>
            <p className="text-sm sm:text-base font-medium text-zinc-900">{formatDate(data.date_retour_atelier)}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-zinc-500">Livraison</p>
            <p className="text-sm sm:text-base font-medium text-zinc-900">{formatDate(data.date_livraison_client)}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-zinc-500">Statut</p>
            <p className="text-sm sm:text-base font-medium text-zinc-900">{data.statut}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-zinc-500">Urgent</p>
            <p className="text-sm sm:text-base font-medium text-zinc-900">{data.urgent ? "Oui" : "Non"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl sm:rounded-2xl border border-zinc-200 bg-white p-3 sm:p-5 shadow-sm">
        <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold">Bijoux</h3>
        <div className="space-y-3 sm:space-y-4">
          {data.bijoux.map((bijou, index) => (
            <div key={`${bijou.type_produit}-${index}`} className="rounded-lg sm:rounded-xl border border-zinc-200 p-3 sm:p-4 bg-gradient-to-br from-white to-zinc-50/30">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <p className="text-xs sm:text-sm text-zinc-500">Produit</p>
                  <p className="text-sm sm:text-base font-semibold text-zinc-900">
                    {bijou.type_produit === "autre" && bijou.type_produit_personnalise?.trim()
                      ? bijou.type_produit_personnalise
                      : bijou.type_produit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-zinc-500">Prix</p>
                  <p className="text-sm sm:text-base font-bold text-amber-900">{formatPrix(bijou.prix_reparation)}</p>
                </div>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-zinc-500 mb-1">Gramage</p>
                <p className="text-sm sm:text-base font-medium text-zinc-900">
                  {bijou.grammage_produit ? `${bijou.grammage_produit} g` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-zinc-500 mb-1">Description</p>
                <p className="text-sm sm:text-base font-medium text-zinc-900">{bijou.description || "—"}</p>
              </div>
              <BijouPhotosDisplay 
                bijouId={bijou.id}
                initialPhotos={bijou.photos || []}
                editable={true}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
