import { ReparationsTable } from "@/components/reparations-table";
import { getHistoriqueReparations } from "@/lib/reparations";

export default async function HistoriquePage() {
  const rows = await getHistoriqueReparations();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">Historique</h2>
        <p className="text-xs sm:text-sm text-zinc-600">Historique complet des réparations</p>
      </div>
      <ReparationsTable rows={rows} title="Historique des réparations" />
    </div>
  );
}
