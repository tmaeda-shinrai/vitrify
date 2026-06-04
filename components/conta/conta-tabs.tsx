"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

/**
 * Abas internas da Conta (#0019): Perfil (`/conta`) e Meu plano (`/conta/plano`).
 * Espelha o padrão de `SectionTabs` (Pedidos/Estatísticas).
 */
const tabs = [
  { key: "profileTab", href: "/conta" },
  { key: "planTab", href: "/conta/plano" },
] as const;

export function ContaTabs() {
  const t = useTranslations("plano");
  const pathname = usePathname();

  return (
    <nav
      aria-label={`${t("profileTab")} / ${t("planTab")}`}
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
