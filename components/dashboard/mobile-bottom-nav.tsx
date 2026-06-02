"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { mobileNavItems, type NavItem } from "@/components/dashboard/nav-items";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations("dashboard");
  const { data } = useCurrentUser();
  const slug = data?.vitrine?.slug;

  return (
    <nav
      aria-label={t("nav")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background md:hidden"
    >
      <ul className="grid grid-cols-4">
        {mobileNavItems.map((item) => (
          <li key={item.key}>
            <NavLink
              item={item}
              label={t(item.key)}
              active={!item.vitrine && isActive(pathname, item.href)}
              slug={slug}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}

function NavLink({
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
    "flex h-16 min-h-[44px] flex-col items-center justify-center gap-1 text-xs",
    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
  );

  if (item.vitrine) {
    // Preview da vitrine pública em nova aba (rota pública em #0012).
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
