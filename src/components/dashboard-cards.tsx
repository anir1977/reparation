import { CalendarDaysIcon, CalendarIcon, ChartBarIcon, RectangleStackIcon } from "@heroicons/react/24/outline";

export function DashboardCards({
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
      value: today,
      icon: <CalendarDaysIcon className="h-8 w-8 md:h-10 md:w-10" />, 
      bg: "from-amber-100 via-amber-50 to-white",
      iconColor: "text-amber-600",
    },
    {
      label: "Ce mois",
      value: month,
      icon: <CalendarIcon className="h-8 w-8 md:h-10 md:w-10" />, 
      bg: "from-yellow-100 via-yellow-50 to-white",
      iconColor: "text-yellow-600",
    },
    {
      label: "3 derniers mois",
      value: threeMonths,
      icon: <ChartBarIcon className="h-8 w-8 md:h-10 md:w-10" />, 
      bg: "from-orange-100 via-orange-50 to-white",
      iconColor: "text-orange-600",
    },
    {
      label: "Total",
      value: total,
      icon: <RectangleStackIcon className="h-8 w-8 md:h-10 md:w-10" />, 
      bg: "from-amber-200 via-amber-100 to-white",
      iconColor: "text-amber-700",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-6">
      {cards.map((card) => (
        <article
          key={card.label}
          className={`rounded-2xl border-2 border-amber-100/50 bg-gradient-to-br ${card.bg} p-5 md:p-7 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col items-center justify-center text-center`}
        >
          <div className={`mb-2 md:mb-3 ${card.iconColor}`}>{card.icon}</div>
          <p className="text-lg md:text-2xl font-bold text-zinc-900 mb-1">{card.value}</p>
          <p className="text-xs md:text-sm font-semibold text-zinc-600 uppercase tracking-wide">{card.label}</p>
        </article>
      ))}
    </section>
  );
}
