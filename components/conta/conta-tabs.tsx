"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

/**
 * Abas internas da Conta: Perfil (`/conta`), Meu plano (`/conta/plano`), Indicações
 * (#0019/#0020), Meus dados e Privacidade (#0021). Rolagem horizontal no mobile,
 * já que são 5 abas.
 */
const tabs = [
  { key: "profileTab", href: "/conta" },
  { key: "planTab", href: "/conta/plano" },
  { key: "referralsTab", href: "/conta/indicacoes" },
  { key: "dataTab", href: "/conta/dados" },
  { key: "privacyTab", href: "/conta/privacidade" },
] as const;

export function ContaTabs() {
  const t = useTranslations("plano");
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("profileTab")}
      className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1"
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "whitespace-nowrap rounded-md px-3 py-1.5 text-center text-sm font-medium transition-colors",
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
