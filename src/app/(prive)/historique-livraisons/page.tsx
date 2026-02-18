import { ReparationsTable } from "@/components/reparations-table";
import { getReparationsByStatut } from "@/lib/reparations";

export default async function HistoriqueLivraisonsPage() {
  const rows = await getReparationsByStatut("livré");

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">Historique livraisons</h2>
        <p className="text-sm md:text-base text-zinc-600 mt-1">Réparations livrées aux clients</p>
      </div>
      <ReparationsTable rows={rows} title="Réparations livrées" />
    </div>
  );
}
