import Link from "next/link";
import { DashboardCards } from "@/components/dashboard-cards";
import { getDashboardStats, getRecentReparations } from "@/lib/reparations";

export default async function DashboardPage() {
  const [stats, recent] = await Promise.all([getDashboardStats(), getRecentReparations()]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">Dashboard</h2>
        <p className="text-xs sm:text-sm text-zinc-600">Vue globale des réparations</p>
      </div>

      <DashboardCards today={stats.today} month={stats.month} threeMonths={stats.threeMonths} />

      <section className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
        <Link
          href="/nouvelle-reparation"
          className="rounded-xl sm:rounded-2xl border border-zinc-200 p-4 sm:p-5 text-sm font-medium transition hover:border-amber-300 active:bg-amber-50"
        >
          Créer une nouvelle réparation
        </Link>
        <Link
          href="/reparations-en-cours"
          className="rounded-xl sm:rounded-2xl border border-zinc-200 p-4 sm:p-5 text-sm font-medium transition hover:border-amber-300 active:bg-amber-50"
        >
          Voir les réparations en cours
        </Link>
        <Link
          href="/reparations-pretes"
          className="rounded-xl sm:rounded-2xl border border-zinc-200 p-4 sm:p-5 text-sm font-medium transition hover:border-amber-300 active:bg-amber-50"
        >
          Voir les réparations prêtes
        </Link>
      </section>

      <section className="rounded-xl sm:rounded-2xl border border-amber-100 bg-white p-3 sm:p-5 shadow-lg">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-amber-900">Dernières réparations</h3>
            <p className="text-xs sm:text-sm text-zinc-600">Aperçu rapide des dossiers récents</p>
          </div>
          <Link
            href="/historique"
            className="text-sm font-semibold text-amber-700 hover:text-amber-900 self-start sm:self-auto"
          >
            Voir tout →
          </Link>
        </div>
        <div className="divide-y divide-amber-100">
          {recent.length ? (
            recent.map((item) => (
              <div
                key={item.id}
                className="grid gap-2 sm:gap-3 py-3 sm:grid-cols-[1.6fr_1fr_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900 truncate">{item.client_nom}</p>
                  <p className="text-xs text-zinc-500 truncate">{item.client_telephone ?? "—"}</p>
                </div>
                <div className="text-xs sm:text-sm text-zinc-600 tabular-nums sm:text-right">
                  {new Date(item.date_reception_client).toLocaleDateString("fr-FR")}
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  {item.urgent ? (
                    <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-red-700">
                      Urgent
                    </span>
                  ) : null}
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-amber-800">
                    {item.statut}
                  </span>
                  <Link
                    href={`/reparation/${item.id}`}
                    className="rounded-full border border-zinc-200 bg-white px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-zinc-700 hover:border-zinc-300"
                  >
                    Fiche
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-xs sm:text-sm text-zinc-500">Aucune réparation récente.</p>
          )}
        </div>
      </section>
    </div>
  );
}
