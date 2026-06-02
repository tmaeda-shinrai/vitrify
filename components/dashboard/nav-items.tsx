import { BarChart3, Package, Receipt, Store, User, type LucideIcon } from "lucide-react";

export interface NavItem {
  /** Chave i18n sob o namespace `dashboard`. */
  key: "vitrine" | "products" | "orders" | "stats" | "account";
  /** Rota interna; vazio para o item da vitrine (resolvido pelo slug em runtime). */
  href: string;
  icon: LucideIcon;
  /** Item especial: abre a vitrine pública /<slug> em nova aba. */
  vitrine?: boolean;
}

/** Bottom nav mobile — 4 itens (DESIGN §4.2). */
export const mobileNavItems: NavItem[] = [
  { key: "vitrine", href: "", icon: Store, vitrine: true },
  { key: "products", href: "/produtos", icon: Package },
  { key: "orders", href: "/pedidos", icon: Receipt },
  { key: "account", href: "/conta", icon: User },
];

/** Sidebar desktop — inclui também Estatísticas. */
export const desktopNavItems: NavItem[] = [
  { key: "vitrine", href: "", icon: Store, vitrine: true },
  { key: "products", href: "/produtos", icon: Package },
  { key: "orders", href: "/pedidos", icon: Receipt },
  { key: "stats", href: "/estatisticas", icon: BarChart3 },
  { key: "account", href: "/conta", icon: User },
];
