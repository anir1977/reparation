import { CalendarDaysIcon, CalendarIcon, ChartBarIcon } from "@heroicons/react/24/outline";

export function DashboardCards({
  today,
  month,
  threeMonths,
}: {
  today: number;
  month: number;
  threeMonths: number;
}) {
  const cards = [
    {
      label: "Aujourd'hui",
      value: today,
      icon: <CalendarDaysIcon className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500" />, 
      bg: "from-amber-100 to-amber-50",
    },
    {
      label: "Ce mois",
      value: month,
      icon: <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />, 
      bg: "from-yellow-100 to-yellow-50",
    },
    {
      label: "3 derniers mois",
      value: threeMonths,
      icon: <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-amber-700" />, 
      bg: "from-amber-200 to-amber-50",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-3">
      {cards.map((card) => (
        <article
          key={card.label}
          className={`rounded-xl sm:rounded-2xl border border-amber-100 bg-gradient-to-br ${card.bg} p-4 sm:p-6 shadow-lg flex flex-col items-center justify-center gap-1 sm:gap-2 transition hover:scale-[1.025] hover:shadow-amber-200`}
        >
          <div className="mb-1 sm:mb-2">{card.icon}</div>
          <p className="text-sm sm:text-lg font-semibold text-amber-900">{card.label}</p>
          <p className="text-3xl sm:text-4xl font-bold text-black drop-shadow-sm">{card.value}</p>
        </article>
      ))}
    </section>
  );
}
