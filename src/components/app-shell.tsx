
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { UserIcon, HomeIcon, PlusCircleIcon, WrenchScrewdriverIcon, CheckCircleIcon, BookOpenIcon, ChartBarIcon, UsersIcon } from "@heroicons/react/24/outline";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: <HomeIcon className="h-5 w-5" /> },
  { href: "/nouvelle-reparation", label: "Nouvelle réparation", icon: <PlusCircleIcon className="h-5 w-5" /> },
  { href: "/reparations-en-cours", label: "En cours", icon: <WrenchScrewdriverIcon className="h-5 w-5" /> },
  { href: "/reparations-pretes", label: "Prêtes", icon: <CheckCircleIcon className="h-5 w-5" /> },
  { href: "/historique", label: "Historique", icon: <BookOpenIcon className="h-5 w-5" /> },
  { href: "/statistiques", label: "Statistiques", icon: <ChartBarIcon className="h-5 w-5" /> },
];
const ADMIN_NAV_ITEMS = [{ href: "/utilisateurs", label: "Utilisateurs", icon: <UsersIcon className="h-5 w-5" /> }];

export function AppShell({
  role,
  userName,
  children,
}: {
  role: string;
  userName: string;
  children: React.ReactNode;
}) {
  const navItems = role === "admin" ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-zinc-50 text-black pb-24 md:pb-8">
      <header className="sticky top-0 z-20 border-b-2 border-amber-200/50 bg-white/95 backdrop-blur-xl shadow-lg">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6 lg:px-8 md:py-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-md flex-shrink-0">
              <span className="text-xl md:text-2xl font-black tracking-tight text-white drop-shadow-sm">
                BD
              </span>
            </span>
            <div className="min-w-0">
              <h1 className="text-base md:text-xl font-black tracking-tight text-zinc-900 truncate">
                Ben Daoud <span className="text-amber-700 hidden md:inline">Réparation</span>
              </h1>
              <p className="text-[10px] md:text-xs text-zinc-500 font-semibold truncate">
                <span className="hidden md:inline">{userName} • </span>
                <span className="uppercase tracking-wider text-amber-700 font-bold">{role === "admin" ? "Admin" : "Employé"}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 border-2 border-amber-200 shadow-sm">
              <UserIcon className="h-5 w-5 text-amber-700" />
            </span>
            <LogoutButton />
          </div>
        </div>
        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden md:flex mx-auto w-full max-w-7xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-2 rounded-full border-2 border-amber-100 bg-white/80 px-4 py-2 text-sm font-bold text-zinc-700 shadow-sm transition-all hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900 hover:scale-105 whitespace-nowrap"
            >
              <span className="text-amber-500 group-hover:text-amber-700">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 lg:px-8 md:py-8">{children}</main>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav role={role} />
    </div>
  );
}
