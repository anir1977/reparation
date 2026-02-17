import Image from "next/image";
import { notFound } from "next/navigation";
import { getReparationForEdit } from "@/lib/reparations";
import { WhatsAppNotifyButton } from "@/components/whatsapp-notify-button";

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Fiche reparation</h2>
        <p className="text-sm text-zinc-600">Consultation des details client et bijoux</p>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Client</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-zinc-500">Nom</p>
            <p className="font-medium text-zinc-900">{data.client.nom_complet}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Telephone</p>
            <p className="font-medium text-zinc-900">{data.client.telephone || "—"}</p>
          </div>
        </div>
        <div className="mt-4">
          <WhatsAppNotifyButton
            telephone={data.client.telephone || ""}
            clientNom={data.client.nom_complet}
            totalPrix={totalPrix}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Details reparation</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-zinc-500">Atelier</p>
            <p className="font-medium text-zinc-900">{data.atelier}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Reception</p>
            <p className="font-medium text-zinc-900">{formatDate(data.date_reception_client)}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Retour atelier</p>
            <p className="font-medium text-zinc-900">{formatDate(data.date_retour_atelier)}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Livraison</p>
            <p className="font-medium text-zinc-900">{formatDate(data.date_livraison_client)}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Statut</p>
            <p className="font-medium text-zinc-900">{data.statut}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500">Urgent</p>
            <p className="font-medium text-zinc-900">{data.urgent ? "Oui" : "Non"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Bijoux</h3>
        <div className="space-y-4">
          {data.bijoux.map((bijou, index) => (
            <div key={`${bijou.type_produit}-${index}`} className="rounded-xl border border-zinc-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-zinc-500">Produit</p>
                  <p className="font-medium text-zinc-900">{bijou.type_produit}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Prix</p>
                  <p className="font-medium text-zinc-900">{formatPrix(bijou.prix_reparation)} DH</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm text-zinc-500">Description</p>
                <p className="font-medium text-zinc-900">{bijou.description || "—"}</p>
              </div>
              {bijou.photos?.length ? (
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {bijou.photos.map((url, photoIndex) => (
                    <Image
                      key={`${index}-photo-${photoIndex}`}
                      src={url}
                      alt="Photo bijou"
                      width={160}
                      height={160}
                      unoptimized
                      className="h-20 w-full rounded-md border border-zinc-200 object-cover"
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
