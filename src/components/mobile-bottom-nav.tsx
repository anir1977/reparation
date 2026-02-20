"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  PlusCircleIcon, 
  WrenchScrewdriverIcon, 
  CheckCircleIcon, 
  HandRaisedIcon,
  BookOpenIcon, 
  ChartBarIcon, 
  UsersIcon 
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  PlusCircleIcon as PlusCircleIconSolid,
  WrenchScrewdriverIcon as WrenchScrewdriverIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  HandRaisedIcon as HandRaisedIconSolid,
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
    href: "/historique-livraisons", 
    label: "Livrées", 
    icon: HandRaisedIcon,
    iconSolid: HandRaisedIconSolid
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
    <nav className="no-print fixed bottom-0 left-0 right-0 z-50 border-t-2 border-amber-200/50 bg-white/98 backdrop-blur-xl shadow-2xl md:hidden pb-safe">
      <div className="grid gap-1 px-1.5 py-2.5" style={{ gridTemplateColumns: `repeat(${navItems.length}, 1fr)` }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = isActive ? item.iconSolid : item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-br from-amber-100 to-amber-50 text-amber-800 border-2 border-amber-300 shadow-sm scale-105"
                  : "text-zinc-500 border-2 border-transparent active:bg-zinc-50 hover:text-zinc-700"
              }`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 transition-transform ${
                isActive ? 'scale-110' : 'scale-100'
              }`} />
              <span className={`text-[9px] font-bold truncate w-full text-center uppercase tracking-wide ${
                isActive ? 'font-extrabold' : ''
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
