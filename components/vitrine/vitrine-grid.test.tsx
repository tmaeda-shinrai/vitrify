import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { VitrineGrid } from "@/components/vitrine/vitrine-grid";
import type { ProductListItem } from "@/lib/products";

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));

function make(over: Partial<ProductListItem> = {}): ProductListItem {
  return {
    id: "p1",
    name: "Batom Matte",
    description: null,
    price_cents: 3290,
    promo_price_cents: null,
    is_available: true,
    category_id: null,
    category_name: null,
    brand_id: null,
    brand_name: null,
    images: [],
    cover_url: null,
    ...over,
  };
}

describe("VitrineGrid", () => {
  it("mostra o estado vazio quando não há produtos", () => {
    render(<VitrineGrid products={[]} whatsappNumber={null} />);
    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("renderiza os produtos com promoção riscada e badge de esgotado", () => {
    render(
      <VitrineGrid
        whatsappNumber={null}
        products={[
          make({ id: "a", name: "Perfume", promo_price_cents: 1990 }),
          make({ id: "b", name: "Sombra", price_cents: 4500, is_available: false }),
        ]}
      />,
    );
    expect(screen.getByText("Perfume")).toBeInTheDocument();
    expect(screen.getByText("Sombra")).toBeInTheDocument();
    expect(screen.getByText("R$ 19,90")).toBeInTheDocument();
    expect(screen.getByText("R$ 45,00")).toBeInTheDocument();
    expect(screen.getByText("unavailable")).toBeInTheDocument();
  });

  it("abre o modal de detalhe ao clicar num produto", () => {
    render(
      <VitrineGrid
        whatsappNumber="5511999998888"
        products={[make({ id: "a", name: "Perfume Floral" })]}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Perfume Floral"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "order" })).toHaveAttribute(
      "href",
      "https://wa.me/5511999998888",
    );
  });
});
