"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { desktopNavItems, type NavItem } from "@/components/dashboard/nav-items";
import { useCurrentUser } from "@/hooks/use-current-user";
import { clientEnv } from "@/lib/env";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopSidebar() {
  const pathname = usePathname();
  const t = useTranslations("dashboard");
  const { data } = useCurrentUser();
  const slug = data?.vitrine?.slug;

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-background md:block">
      <div className="sticky top-0 flex h-dvh flex-col gap-1 p-4">
        <Link href="/produtos" className="mb-4 px-2 font-display text-xl font-bold text-primary">
          {clientEnv.NEXT_PUBLIC_APP_NAME}
        </Link>
        <nav aria-label={t("nav")} className="flex flex-col gap-1">
          {desktopNavItems.map((item) => (
            <SidebarLink
              key={item.key}
              item={item}
              label={t(item.key)}
              active={!item.vitrine && isActive(pathname, item.href)}
              slug={slug}
            />
          ))}
        </nav>
        <Link
          href="/ajuda"
          className={cn(
            "mt-auto flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
            isActive(pathname, "/ajuda")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
          aria-current={isActive(pathname, "/ajuda") ? "page" : undefined}
        >
          <HelpCircle className="size-5" />
          {t("help")}
        </Link>
      </div>
    </aside>
  );
}

function SidebarLink({
  item,
  label,
  active,
  slug,
}: {
  item: NavItem;
  label: string;
  active: boolean;
  slug?: string;
}) {
  const Icon = item.icon;
  const className = cn(
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
    active
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-accent hover:text-foreground",
  );

  if (item.vitrine) {
    return slug ? (
      <a href={`/${slug}`} target="_blank" rel="noopener noreferrer" className={className}>
        <Icon className="size-5" />
        {label}
      </a>
    ) : (
      <span className={cn(className, "pointer-events-none opacity-50")} aria-disabled="true">
        <Icon className="size-5" />
        {label}
      </span>
    );
  }

  return (
    <Link href={item.href} className={className} aria-current={active ? "page" : undefined}>
      <Icon className="size-5" />
      {label}
    </Link>
  );
}
