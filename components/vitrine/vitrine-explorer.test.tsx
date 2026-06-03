import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { VitrineExplorer } from "@/components/vitrine/vitrine-explorer";
import type { ProductListItem } from "@/lib/products";

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));

// Isola o estado da URL entre os testes (o explorer lê/escreve window.location).
beforeEach(() => window.history.replaceState(null, "", "/"));

function make(over: Partial<ProductListItem> = {}): ProductListItem {
  return {
    id: "p1",
    name: "Produto",
    description: null,
    price_cents: 1000,
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
  vitrineUrl: "https://x/maria",
  slug: "maria",
};

const products = [
  make({ id: "a", name: "Perfume Floral", category_id: "c1", category_name: "Perfumaria" }),
  make({ id: "b", name: "Batom", category_id: "c2", category_name: "Maquiagem" }),
];

describe("VitrineExplorer", () => {
  it("filtra pela busca (acento-insensível)", () => {
    render(<VitrineExplorer products={products} {...baseProps} />);
    expect(screen.getByText("Perfume Floral")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "perfume" } });
    expect(screen.getByText("Perfume Floral")).toBeInTheDocument();
    expect(screen.queryByText("Batom")).not.toBeInTheDocument();
  });

  it("filtra ao escolher uma categoria", () => {
    render(<VitrineExplorer products={products} {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Maquiagem" }));
    expect(screen.getByText("Batom")).toBeInTheDocument();
    expect(screen.queryByText("Perfume Floral")).not.toBeInTheDocument();
  });

  it("mostra empty state sem resultado e permite limpar", () => {
    render(<VitrineExplorer products={products} {...baseProps} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "zzz" } });
    expect(screen.getByText("noResultsTitle")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "clearFilters" }));
    expect(screen.getByText("Perfume Floral")).toBeInTheDocument();
  });
});
