"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  PlusCircleIcon, 
  WrenchScrewdriverIcon, 
  CheckCircleIcon, 
  BookOpenIcon, 
  ChartBarIcon, 
  UsersIcon 
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  PlusCircleIcon as PlusCircleIconSolid,
  WrenchScrewdriverIcon as WrenchScrewdriverIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  UsersIcon as UsersIconSolid
} from "@heroicons/react/24/solid";

const NAV_ITEMS = [
  { 
    href: "/dashboard", 
    label: "Accueil", 
    icon: HomeIcon,
    iconSolid: HomeIconSolid
  },
  { 
    href: "/nouvelle-reparation", 
    label: "Nouveau", 
    icon: PlusCircleIcon,
    iconSolid: PlusCircleIconSolid
  },
  { 
    href: "/reparations-en-cours", 
    label: "En cours", 
    icon: WrenchScrewdriverIcon,
    iconSolid: WrenchScrewdriverIconSolid
  },
  { 
    href: "/reparations-pretes", 
    label: "Prêtes", 
    icon: CheckCircleIcon,
    iconSolid: CheckCircleIconSolid
  },
  { 
    href: "/statistiques", 
    label: "Stats", 
    icon: ChartBarIcon,
    iconSolid: ChartBarIconSolid
  },
  { 
    href: "/historique", 
    label: "Historique", 
    icon: BookOpenIcon,
    iconSolid: BookOpenIconSolid
  },
];

const ADMIN_NAV_ITEMS = [
  { 
    href: "/utilisateurs", 
    label: "Utilisateurs", 
    icon: UsersIcon,
    iconSolid: UsersIconSolid
  }
];

export function MobileBottomNav({ role }: { role: string }) {
  const pathname = usePathname();
  const navItems = role === "admin" ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-amber-200 bg-white/95 backdrop-blur-md shadow-xl md:hidden pb-safe">
      <div className="grid grid-cols-4 gap-1 px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = isActive ? item.iconSolid : item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 transition-colors ${
                isActive
                  ? "bg-amber-50 text-amber-700 border border-amber-200 shadow-sm"
                  : "text-zinc-600 border border-transparent active:bg-amber-50"
              }`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[10px] font-medium truncate w-full text-center ${
                isActive ? 'font-semibold' : ''
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
