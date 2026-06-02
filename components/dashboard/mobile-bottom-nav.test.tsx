import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";

const mockPathname = vi.fn(() => "/produtos");
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

// i18n: devolve a própria chave para asserções simples.
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/hooks/use-current-user", () => ({
  useCurrentUser: () => ({ data: { vitrine: { slug: "minha-loja" } } }),
}));

describe("MobileBottomNav", () => {
  beforeEach(() => mockPathname.mockReturnValue("/produtos"));

  it("renderiza os 4 itens da nav mobile", () => {
    render(<MobileBottomNav />);
    ["vitrine", "products", "orders", "account"].forEach((key) => {
      expect(screen.getByText(key)).toBeInTheDocument();
    });
  });

  it("marca o item ativo conforme o pathname (aria-current)", () => {
    render(<MobileBottomNav />);
    const active = screen.getByText("products").closest("a");
    expect(active).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("orders").closest("a")).not.toHaveAttribute("aria-current");
  });

  it("aponta o item Vitrine para /<slug> em nova aba", () => {
    render(<MobileBottomNav />);
    const vitrine = screen.getByText("vitrine").closest("a");
    expect(vitrine).toHaveAttribute("href", "/minha-loja");
    expect(vitrine).toHaveAttribute("target", "_blank");
  });
});
