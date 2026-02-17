import { ReparationsTable } from "@/components/reparations-table";
import { getReparationsByStatut } from "@/lib/reparations";

export default async function ReparationsEnCoursPage() {
  const rows = await getReparationsByStatut("en cours");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Réparations en cours</h2>
        <p className="text-sm text-zinc-600">Suivi des réparations actuellement en traitement</p>
      </div>
      <ReparationsTable rows={rows} title="Liste des réparations en cours" />
    </div>
  );
}
