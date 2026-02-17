
import { getStatistiques } from "@/lib/reparations";
import { ChartBarIcon, WrenchScrewdriverIcon, UserGroupIcon } from "@heroicons/react/24/outline";

export default async function StatistiquesPage() {
  const stats = await getStatistiques();

  return (
    <div className="space-y-5 md:space-y-8">
      <div className="text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">Statistiques</h2>
        <p className="text-sm md:text-base text-zinc-600 mt-1">Répartition des réparations</p>
      </div>

      <section className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2">
        <article className="rounded-2xl border-2 border-amber-100/50 bg-gradient-to-br from-amber-50 to-white p-5 md:p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-5">
            <div className="rounded-xl bg-amber-100 p-3">
              <ChartBarIcon className="h-6 w-6 md:h-7 md:w-7 text-amber-700" />
            </div>
            <h3 className="text-lg md:text-xl font-black text-zinc-900">Par statut</h3>
          </div>
          <ul className="space-y-3">
            {stats.parStatut.map((item) => (
              <li key={item.label} className="flex items-center justify-between rounded-xl border-2 border-amber-100 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-sm md:text-base font-bold text-zinc-700">{item.label}</span>
                <span className="text-xl md:text-2xl font-black text-amber-700">{item.value}</span>
              </li>
            ))}
            {!stats.parStatut.length && (
              <li className="text-sm text-zinc-500 text-center py-8 font-medium">
                Aucune donnée disponible
              </li>
            )}
          </ul>
        </article>

        <article className="rounded-2xl border-2 border-yellow-100/50 bg-gradient-to-br from-yellow-50 to-white p-5 md:p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-5">
            <div className="rounded-xl bg-yellow-100 p-3">
              <WrenchScrewdriverIcon className="h-6 w-6 md:h-7 md:w-7 text-yellow-700" />
            </div>
            <h3 className="text-lg md:text-xl font-black text-zinc-900">Par atelier</h3>
          </div>
          <ul className="space-y-3">
            {stats.parAtelier.map((item) => (
              <li key={item.label} className="flex items-center justify-between rounded-xl border-2 border-yellow-100 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-sm md:text-base font-bold text-zinc-700">{item.label}</span>
                <span className="text-xl md:text-2xl font-black text-yellow-700">{item.value}</span>
              </li>
            ))}
            {!stats.parAtelier.length && (
              <li className="text-sm text-zinc-500 text-center py-8 font-medium">
                Aucune donnée disponible
              </li>
            )}
          </ul>
        </article>
      </section>
    </div>
  );
}
