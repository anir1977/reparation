import Link from "next/link";
import { DashboardCards } from "@/components/dashboard-cards";
import { getDashboardStats, getRecentReparations } from "@/lib/reparations";
import { 
  PlusCircleIcon, 
  UserGroupIcon, 
  CreditCardIcon, 
  ClockIcon 
} from "@heroicons/react/24/outline";

export default async function DashboardPage() {
  const [stats, recent] = await Promise.all([getDashboardStats(), getRecentReparations()]);

  return (
    <div className="space-y-5 md:space-y-8">
      <div className="text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">Tableau de bord</h2>
        <p className="text-sm md:text-base text-zinc-600 mt-1">Vue d'ensemble de votre activité</p>
      </div>

      <DashboardCards today={stats.today} month={stats.month} threeMonths={stats.threeMonths} total={stats.total} />

      <section>
        <h3 className="text-lg md:text-xl font-bold text-zinc-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <Link
            href="/nouvelle-reparation"
            className="group rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 md:p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-amber-300 flex flex-col items-center justify-center text-center gap-3"
          >
            <div className="rounded-full bg-amber-100 p-4 group-hover:bg-amber-200 transition-colors">
              <PlusCircleIcon className="h-8 w-8 md:h-10 md:w-10 text-amber-700" />
            </div>
            <span className="text-sm md:text-base font-bold text-zinc-900">Nouvelle<br/>réparation</span>
          </Link>
          <Link
            href="/reparations-en-cours"
            className="group rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 md:p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-blue-300 flex flex-col items-center justify-center text-center gap-3"
          >
            <div className="rounded-full bg-blue-100 p-4 group-hover:bg-blue-200 transition-colors">
              <ClockIcon className="h-8 w-8 md:h-10 md:w-10 text-blue-700" />
            </div>
            <span className="text-sm md:text-base font-bold text-zinc-900">En cours</span>
          </Link>
          <Link
            href="/historique"
            className="group rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6 md:p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-purple-300 flex flex-col items-center justify-center text-center gap-3"
          >
            <div className="rounded-full bg-purple-100 p-4 group-hover:bg-purple-200 transition-colors">
              <UserGroupIcon className="h-8 w-8 md:h-10 md:w-10 text-purple-700" />
            </div>
            <span className="text-sm md:text-base font-bold text-zinc-900">Clients</span>
          </Link>
          <Link
            href="/reparations-pretes"
            className="group rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 md:p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-emerald-300 flex flex-col items-center justify-center text-center gap-3"
          >
            <div className="rounded-full bg-emerald-100 p-4 group-hover:bg-emerald-200 transition-colors">
              <CreditCardIcon className="h-8 w-8 md:h-10 md:w-10 text-emerald-700" />
            </div>
            <span className="text-sm md:text-base font-bold text-zinc-900">Paiement</span>
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg md:text-xl font-bold text-zinc-900">Activité récente</h3>
          <Link
            href="/historique"
            className="text-sm font-bold text-amber-700 hover:text-amber-900 transition-colors"
          >
            Voir tout →
          </Link>
        </div>
        
        {recent.length ? (
          <div className="space-y-3">
            {recent.map((item) => (
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
                    {item.urgent && (
                      <span className="rounded-full border-2 border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700 uppercase tracking-wide">
                        Urgent
                      </span>
                    )}
                    <span className="rounded-full border-2 border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800 uppercase tracking-wide">
                      {item.statut}
                    </span>
                  </div>
                </div>
                <div className="text-xs md:text-sm text-zinc-500 font-medium">
                  {new Date(item.date_reception_client).toLocaleDateString("fr-FR", { 
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
            <p className="text-zinc-500 font-medium">Aucune réparation récente</p>
            <p className="text-sm text-zinc-400 mt-1">Créez votre première réparation</p>
          </div>
        )}
      </section>
    </div>
  );
}
