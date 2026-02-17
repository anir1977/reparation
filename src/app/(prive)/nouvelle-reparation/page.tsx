import { RepairForm } from "@/components/repair-form";
import { getReparationForEdit } from "@/lib/reparations";

export default async function NouvelleReparationPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const params = await searchParams;
  const editId = params.edit;
  const initialData = editId ? await getReparationForEdit(editId) : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">
          {initialData ? "Modifier une réparation" : "Nouvelle réparation"}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600">
          Saisie client, bijoux, atelier, dates, prix et statut
        </p>
      </div>
      <RepairForm initialData={initialData} />
    </div>
  );
}
