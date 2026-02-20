import { CalendarDaysIcon, CalendarIcon, ChartBarIcon, RectangleStackIcon } from "@heroicons/react/24/outline";
import { memo } from "react";

export const DashboardCards = memo(function DashboardCards({
  today,
  month,
  threeMonths,
  total,
}: {
  today: number;
  month: number;
  threeMonths: number;
  total: number;
}) {
  const cards = [
    {
      label: "Aujourd'hui",
      hint: "Articles enregistrés",
      value: today,
      icon: <CalendarDaysIcon className="h-8 w-8 md:h-10 md:w-10" />, 
      bg: "from-amber-50 to-white",
      iconColor: "text-amber-600",
    },
    {
      label: "Ce mois",
      hint: "Volume mensuel",
      value: month,
      icon: <CalendarIcon className="h-8 w-8 md:h-10 md:w-10" />, 
      bg: "from-yellow-50 to-white",
      iconColor: "text-yellow-600",
    },
    {
      label: "3 derniers mois",
      hint: "Tendance trimestre",
      value: threeMonths,
      icon: <ChartBarIcon className="h-8 w-8 md:h-10 md:w-10" />, 
      bg: "from-orange-50 to-white",
      iconColor: "text-orange-600",
    },
    {
      label: "Total",
      hint: "Depuis le début",
      value: total,
      icon: <RectangleStackIcon className="h-8 w-8 md:h-10 md:w-10" />, 
      bg: "from-amber-100 to-white",
      iconColor: "text-amber-700",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-6">
      {cards.map((card) => (
        <article
          key={card.label}
          className={`rounded-2xl border border-zinc-200 bg-linear-to-br ${card.bg} p-4 md:p-5 shadow-sm transition hover:shadow-md`}
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] md:text-xs font-semibold text-zinc-600 uppercase tracking-wide">{card.label}</p>
            <div className={card.iconColor}>{card.icon}</div>
          </div>
          <p className="text-2xl md:text-3xl font-black text-zinc-900">{card.value}</p>
          <p className="mt-1 text-xs text-zinc-500">{card.hint}</p>
        </article>
      ))}
    </section>
  );
});
