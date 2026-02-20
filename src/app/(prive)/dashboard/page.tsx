import Link from "next/link";
import { DashboardCards } from "@/components/dashboard-cards";
import { getDashboardStats, getReparationsByStatut } from "@/lib/reparations";
import { 
  PlusCircleIcon, 
  UserGroupIcon, 
  CreditCardIcon, 
  ClockIcon 
} from "@heroicons/react/24/outline";

export default async function DashboardPage() {
  const [stats, deliveredRows] = await Promise.all([
    getDashboardStats(),
    getReparationsByStatut("livré"),
  ]);

  const delivered = deliveredRows.slice(0, 8);

  return (
    <div className="space-y-5 md:space-y-8">
      <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm md:px-6 md:py-5">
        <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">Tableau de bord</h2>
        <p className="mt-1 text-sm md:text-base text-zinc-600">Vue d'ensemble de votre activité</p>
      </div>

      <DashboardCards today={stats.today} month={stats.month} threeMonths={stats.threeMonths} total={stats.total} />

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:p-5">
        <h3 className="mb-4 text-lg md:text-xl font-bold text-zinc-900">Actions rapides</h3>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <Link
            href="/nouvelle-reparation"
            className="group rounded-2xl border border-amber-200 bg-linear-to-br from-amber-50 to-white p-5 md:p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-3 inline-flex rounded-full bg-amber-100 p-3">
              <PlusCircleIcon className="h-8 w-8 md:h-10 md:w-10 text-amber-700" />
            </div>
            <p className="text-sm md:text-base font-bold text-zinc-900">Nouvelle réparation</p>
            <p className="mt-1 text-xs text-zinc-500">Créer un nouveau dossier client</p>
          </Link>
          <Link
            href="/reparations-en-cours"
            className="group rounded-2xl border border-blue-200 bg-linear-to-br from-blue-50 to-white p-5 md:p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-3 inline-flex rounded-full bg-blue-100 p-3">
              <ClockIcon className="h-8 w-8 md:h-10 md:w-10 text-blue-700" />
            </div>
            <p className="text-sm md:text-base font-bold text-zinc-900">Réparations en cours</p>
            <p className="mt-1 text-xs text-zinc-500">Suivre les dossiers actifs</p>
          </Link>
          <Link
            href="/historique"
            className="group rounded-2xl border border-purple-200 bg-linear-to-br from-purple-50 to-white p-5 md:p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-3 inline-flex rounded-full bg-purple-100 p-3">
              <UserGroupIcon className="h-8 w-8 md:h-10 md:w-10 text-purple-700" />
            </div>
            <p className="text-sm md:text-base font-bold text-zinc-900">Historique clients</p>
            <p className="mt-1 text-xs text-zinc-500">Consulter les anciens dossiers</p>
          </Link>
          <Link
            href="/reparations-pretes"
            className="group rounded-2xl border border-emerald-200 bg-linear-to-br from-emerald-50 to-white p-5 md:p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-3 inline-flex rounded-full bg-emerald-100 p-3">
              <CreditCardIcon className="h-8 w-8 md:h-10 md:w-10 text-emerald-700" />
            </div>
            <p className="text-sm md:text-base font-bold text-zinc-900">Prêtes à livrer</p>
            <p className="mt-1 text-xs text-zinc-500">Dossiers finalisés en attente client</p>
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg md:text-xl font-bold text-zinc-900">Historique clients livrés</h3>
          <Link
            href="/historique-livraisons"
            className="text-sm font-bold text-amber-700 hover:text-amber-900 transition-colors"
          >
            Voir tout →
          </Link>
        </div>
        
        {delivered.length ? (
          <div className="space-y-3">
            {delivered.map((item) => (
              <Link
                key={item.id}
                href={`/reparation/${item.id}`}
                className="group block rounded-2xl border-2 border-zinc-100 bg-white p-4 md:p-5 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base md:text-lg text-zinc-900 truncate group-hover:text-amber-900 transition-colors">
                      {item.client_nom}
                    </h4>
                    <p className="text-sm text-zinc-600 truncate mt-0.5">{item.client_telephone ?? "—"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="rounded-full border-2 border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                      Livré
                    </span>
                  </div>
                </div>
                <div className="text-xs md:text-sm text-zinc-500 font-medium">
                  {new Date(item.date_livraison_client || item.date_reception_client).toLocaleDateString("fr-FR", { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-12 text-center">
            <p className="text-zinc-500 font-medium">Aucun client livré pour le moment</p>
            <p className="text-sm text-zinc-400 mt-1">Les livraisons apparaîtront ici automatiquement</p>
          </div>
        )}
      </section>
    </div>
  );
}
