"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

/**
 * Abas que cruzam "Pedidos" e "Estatísticas" (mesmo milestone). No mobile o bottom
 * nav só tem 4 ícones (DESIGN §4.2) e não inclui Estatísticas — estas abas são o
 * caminho de descoberta entre as duas telas. Reusa os rótulos do namespace `dashboard`.
 */
const tabs = [
  { key: "orders", href: "/pedidos" },
  { key: "stats", href: "/estatisticas" },
] as const;

export function SectionTabs() {
  const t = useTranslations("dashboard");
  const pathname = usePathname();

  return (
    <nav
      aria-label={`${t("orders")} / ${t("stats")}`}
      className="flex gap-1 rounded-lg bg-muted p-1"
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-center text-sm font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t(tab.key)}
          </Link>
        );
      })}
    </nav>
  );
}
