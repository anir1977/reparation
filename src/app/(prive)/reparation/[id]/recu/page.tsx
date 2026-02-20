import { notFound } from "next/navigation";
import { getReparationForEdit } from "@/lib/reparations";
import { PrintTrigger } from "@/components/print-trigger";
import { PrintButton } from "../../../../../components/print-button";

function formatDate(dateValue: string | null) {
  if (!dateValue) return "—";
  return new Date(dateValue).toLocaleDateString("fr-FR");
}

function formatPrix(value: string | number) {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(numeric);
}

export default async function ReparationRecuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getReparationForEdit(id);

  if (!data) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl bg-white p-3 sm:p-8 text-black">
      <PrintTrigger />
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          header { display: none !important; }
          nav { display: none !important; }
          footer { display: none !important; }
          .recu-cards { display: none !important; }
          .recu-table { display: block !important; }
          @page {
            margin: 20mm;
          }
        }
        @media screen {
          header { display: none !important; }
          nav { display: none !important; }
          main { padding: 0 !important; max-width: 100% !important; }
        }
        @media screen and (max-width: 640px) {
          .recu-table { display: none; }
          .recu-cards { display: block; }
        }
        @media screen and (min-width: 641px) {
          .recu-cards { display: none; }
        }
      `}</style>

      <div className="no-print mb-4 sm:mb-6 flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-bold">Reçu de dépôt</h1>
        <PrintButton />
      </div>

      <header className="mb-4 sm:mb-6 border-b border-zinc-200 pb-3 sm:pb-4">
        <h2 className="text-xl sm:text-2xl font-bold">Ben Daoud Bijouterie</h2>
        <p className="text-xs sm:text-sm text-zinc-600">Reçu de dépôt d'articles</p>
        <p className="mt-2 text-xs sm:text-sm text-zinc-700">Numéro de série: {data.id}</p>
      </header>

      <section className="mb-4 sm:mb-6 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs sm:text-sm text-zinc-500">Client</p>
          <p className="text-sm sm:text-base font-medium">{data.client.nom_complet}</p>
          <p className="text-xs sm:text-sm text-zinc-600">{data.client.telephone || "—"}</p>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-zinc-500">Date de dépôt</p>
          <p className="text-sm sm:text-base font-medium">{formatDate(data.date_reception_client)}</p>
        </div>
      </section>

      <section className="mb-4 sm:mb-6">
        <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-semibold">Articles déposés</h3>
        <div className="recu-cards space-y-2">
          {data.bijoux.map((bijou, index) => (
            <div
              key={`${bijou.type_produit}-${index}-card`}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
            >
              <p className="text-xs text-zinc-500">Article</p>
              <p className="text-sm font-medium text-zinc-900">
                {bijou.type_produit === "autre" && bijou.type_produit_personnalise?.trim()
                  ? bijou.type_produit_personnalise
                  : bijou.type_produit}
              </p>
              <p className="mt-1 text-xs text-zinc-500">Description</p>
              <p className="text-sm text-zinc-800">{bijou.description || "—"}</p>
              <p className="mt-1 text-xs text-zinc-500">Prix</p>
              <p className="text-sm font-bold text-amber-900">{formatPrix(bijou.prix_reparation)}</p>
            </div>
          ))}
        </div>
        <div className="recu-table overflow-hidden rounded-lg border border-zinc-200">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-zinc-50 text-left">
              <tr>
                <th className="px-3 py-2">Article</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2 text-right">Prix</th>
              </tr>
            </thead>
            <tbody>
              {data.bijoux.map((bijou, index) => (
                <tr key={`${bijou.type_produit}-${index}`} className="border-t border-zinc-100">
                  <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium">
                    {bijou.type_produit === "autre" && bijou.type_produit_personnalise?.trim()
                      ? bijou.type_produit_personnalise
                      : bijou.type_produit}
                  </td>
                  <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm">{bijou.description || "—"}</td>
                  <td className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-bold text-amber-900 text-right">{formatPrix(bijou.prix_reparation)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-4 sm:mb-6 border-t-2 border-zinc-300 pt-3 sm:pt-4">
        <div className="flex items-center justify-between">
          <p className="text-base sm:text-lg font-semibold">Prix total</p>
          <p className="text-lg sm:text-2xl font-black text-amber-900">
            {formatPrix(data.bijoux.reduce((sum, b) => sum + Number(b.prix_reparation || 0), 0))}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4 text-xs sm:text-sm text-red-700">
        En cas de perte de ce reçu, une déclaration de perte est obligatoire pour retirer les
        articles déposés.
      </section>
    </div>
  );
}
