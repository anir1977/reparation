import { notFound } from "next/navigation";
import { getReparationForEdit } from "@/lib/reparations";
import { PrintTrigger } from "@/components/print-trigger";
import { PrintButton } from "../../../../../components/print-button";

function formatDate(dateValue: string | null) {
  if (!dateValue) return "—";
  return new Date(dateValue).toLocaleDateString("fr-FR");
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
    <div className="mx-auto w-full max-w-3xl bg-white p-8 text-black">
      <PrintTrigger />
      <style>{`
        @media print {
          .no-print { display: none; }
          body { background: white; }
        }
        @media screen {
          header { display: none !important; }
          nav { display: none !important; }
          main { padding: 0 !important; max-width: 100% !important; }
        }
      `}</style>

      <div className="no-print mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Recu de depot</h1>
        <PrintButton />
      </div>

      <div className="mb-2 text-center text-lg font-bold">Ben Daoud Bijouterie</div>

      <header className="mb-6 border-b border-zinc-200 pb-4">
        <h2 className="text-2xl font-bold">Ben Daoud Bijouterie</h2>
        <p className="text-sm text-zinc-600">Recu de depot d'articles</p>
        <p className="mt-2 text-sm text-zinc-700">Numero de serie: {data.id}</p>
      </header>

      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-zinc-500">Client</p>
          <p className="font-medium">{data.client.nom_complet}</p>
          <p className="text-sm text-zinc-600">{data.client.telephone || "—"}</p>
        </div>
        <div>
          <p className="text-sm text-zinc-500">Date de depot</p>
          <p className="font-medium">{formatDate(data.date_reception_client)}</p>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="mb-3 text-lg font-semibold">Articles deposes</h3>
        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-left">
              <tr>
                <th className="px-3 py-2">Article</th>
                <th className="px-3 py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {data.bijoux.map((bijou, index) => (
                <tr key={`${bijou.type_produit}-${index}`} className="border-t border-zinc-100">
                  <td className="px-3 py-2 font-medium">{bijou.type_produit}</td>
                  <td className="px-3 py-2">{bijou.description || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        En cas de perte de ce recu, une declaration de perte est obligatoire pour retirer les
        articles deposes.
      </section>
    </div>
  );
}
