import { ReparationsTable } from "@/components/reparations-table";
import { getReparationsByStatut } from "@/lib/reparations";

export default async function ReparationsPretesPage() {
  const rows = await getReparationsByStatut("prêt");

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">Réparations prêtes</h2>
        <p className="text-xs sm:text-sm text-zinc-600">Réparations prêtes à être livrées au client</p>
      </div>
      <ReparationsTable rows={rows} title="Liste des réparations prêtes" />
    </div>
  );
}
