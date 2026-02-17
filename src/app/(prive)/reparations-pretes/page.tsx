import { ReparationsTable } from "@/components/reparations-table";
import { getReparationsByStatut } from "@/lib/reparations";

export default async function ReparationsPretesPage() {
  const rows = await getReparationsByStatut("prêt");

  return (
    <div className="space-y-5 md:space-y-8">
      <div className="text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">Prêtes</h2>
        <p className="text-sm md:text-base text-zinc-600 mt-1">Réparations prêtes à livrer</p>
      </div>
      <ReparationsTable rows={rows} title="Réparations prêtes" />
    </div>
  );
}
