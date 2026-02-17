
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-zinc-50 text-black pb-28 md:pb-0">
      <header className="sticky top-0 z-20 border-b border-amber-200 bg-white/90 backdrop-blur shadow-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-3 py-2 sm:px-6 lg:px-8 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black border-2 border-amber-700 shadow flex-shrink-0">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{letterSpacing: '0.01em', color:'#facc15'}}>
                BD
              </span>
            </span>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-amber-900 truncate">
                Ben Daoud <span className="text-zinc-700 hidden sm:inline">Réparation</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-zinc-500 font-medium truncate">
                <span className="hidden sm:inline">{userName} • </span>
                <span className="uppercase tracking-wider text-amber-700">{role === "admin" ? "Admin" : "Employé"}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <span className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 border border-amber-300">
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
              className="group flex items-center gap-2 rounded-full border border-amber-100 bg-white/80 px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900 whitespace-nowrap"
            >
              <span className="text-amber-500 group-hover:text-amber-700">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 lg:px-8 sm:py-6">{children}</main>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav role={role} />
    </div>
  );
}
