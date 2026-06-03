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

const baseProps = {
  whatsapp: "5511999998888",
  ownerName: "Maria",
  vitrineUrl: "https://vitrinio.com.br/maria",
  slug: "maria",
};

describe("VitrineGrid", () => {
  it("renderiza produtos com promoção, CTA por card e esgotado desabilitado", () => {
    render(
      <VitrineGrid
        {...baseProps}
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
    // só o disponível tem link de pedido; o esgotado vira botão desabilitado
    expect(screen.getAllByRole("link", { name: "order" })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "unavailable" })).toBeDisabled();
  });

  it("abre o modal de detalhe ao clicar num produto", () => {
    render(<VitrineGrid {...baseProps} products={[make({ id: "a", name: "Perfume Floral" })]} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Perfume Floral"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
