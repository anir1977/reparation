
import { getStatistiques } from "@/lib/reparations";
import { ChartBarIcon, WrenchScrewdriverIcon, UserGroupIcon } from "@heroicons/react/24/outline";

export default async function StatistiquesPage() {
  const stats = await getStatistiques();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-amber-900">Statistiques</h2>
        <p className="text-base text-zinc-600">Répartition des réparations par statut et atelier</p>
      </div>

      <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <article className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-7 shadow-lg flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <ChartBarIcon className="h-7 w-7 text-amber-500" />
            <h3 className="text-lg font-bold text-amber-900">Par statut</h3>
          </div>
          <ul className="space-y-3">
            {stats.parStatut.map((item) => (
              <li key={item.label} className="flex items-center justify-between rounded-xl border border-amber-100 bg-white px-4 py-3 shadow-sm">
                <span className="font-medium text-zinc-700">{item.label}</span>
                <span className="text-xl font-bold text-amber-700">{item.value}</span>
              </li>
            ))}
            {!stats.parStatut.length ? <li className="text-zinc-500">Aucune donnée</li> : null}
          </ul>
        </article>

        <article className="rounded-2xl border border-amber-100 bg-gradient-to-br from-yellow-50 to-white p-7 shadow-lg flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <WrenchScrewdriverIcon className="h-7 w-7 text-yellow-600" />
            <h3 className="text-lg font-bold text-amber-900">Par atelier</h3>
          </div>
          <ul className="space-y-3">
            {stats.parAtelier.map((item) => (
              <li key={item.label} className="flex items-center justify-between rounded-xl border border-amber-100 bg-white px-4 py-3 shadow-sm">
                <span className="font-medium text-zinc-700">{item.label}</span>
                <span className="text-xl font-bold text-yellow-700">{item.value}</span>
              </li>
            ))}
            {!stats.parAtelier.length ? <li className="text-zinc-500">Aucune donnée</li> : null}
          </ul>
        </article>
      </section>
    </div>
  );
}
