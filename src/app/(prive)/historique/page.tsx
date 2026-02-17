import { ReparationsTable } from "@/components/reparations-table";
import { getHistoriqueReparations } from "@/lib/reparations";

export default async function HistoriquePage() {
  const rows = await getHistoriqueReparations();

  return (
    <div className="space-y-5 md:space-y-8">
      <div className="text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">Historique</h2>
        <p className="text-sm md:text-base text-zinc-600 mt-1">Historique complet des réparations</p>
      </div>
      <ReparationsTable rows={rows} title="Toutes les réparations" />
    </div>
  );
}
