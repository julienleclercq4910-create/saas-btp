"use client";

import type { Route } from "next";
import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ClipboardList, FolderKanban, Gauge, Ruler, Settings, Users, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const links: Array<{ href: Route; label: string; icon: ComponentType<{ className?: string }> }> = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/projects", label: "Chantiers", icon: Building2 },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/tasks", label: "Taches", icon: ClipboardList },
  { href: "/documents", label: "Documents", icon: FolderKanban },
  { href: "/measurements", label: "Mesures", icon: Ruler },
  { href: "/billing", label: "Abonnement", icon: Wallet },
  { href: "/settings", label: "Parametres", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-white p-4 lg:flex">
      <div className="mb-8 rounded-lg bg-primary px-4 py-3 text-primary-foreground">
        <p className="text-xs uppercase tracking-[0.2em] opacity-80">AtelierFlow</p>
        <p className="text-lg font-semibold">Pilotage BTP</p>
      </div>
      <nav className="space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition",
              pathname === href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-slate-100"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
