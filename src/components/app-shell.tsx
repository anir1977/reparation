
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-zinc-50 text-black">
      <header className="sticky top-0 z-20 border-b border-amber-200 bg-white/90 backdrop-blur shadow-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black border-2 border-amber-700 shadow">
              <span className="text-2xl font-extrabold tracking-tight" style={{letterSpacing: '0.01em', color:'#facc15'}}>
                BD
              </span>
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-amber-900">Ben Daoud <span className="text-zinc-700">Réparation</span></h1>
              <p className="text-xs text-zinc-500 font-medium">
                {userName} • <span className="uppercase tracking-wider text-amber-700">{role === "admin" ? "Admin" : "Employé"}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 border border-amber-300">
              <UserIcon className="h-5 w-5 text-amber-700" />
            </span>
            <LogoutButton />
          </div>
        </div>
        <nav className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-2 rounded-full border border-amber-100 bg-white/80 px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900"
            >
              <span className="text-amber-500 group-hover:text-amber-700">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
