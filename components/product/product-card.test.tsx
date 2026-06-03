import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProductCard } from "@/components/product/product-card";
import type { ProductListItem } from "@/lib/products";

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));

const base: ProductListItem = {
  id: "p1",
  name: "Batom Matte Vermelho",
  description: "Longa duração",
  price_cents: 3290,
  promo_price_cents: null,
  is_available: true,
  category_id: null,
  category_name: null,
  brand_id: null,
  brand_name: null,
  images: ["https://proj.supabase.co/storage/v1/object/public/products/u/a.webp"],
  cover_url: "https://proj.supabase.co/storage/v1/object/public/products/u/a.webp",
};

describe("ProductCard", () => {
  it("mostra o nome e o preço formatado em reais", () => {
    render(<ProductCard product={base} />);
    expect(screen.getByText("Batom Matte Vermelho")).toBeInTheDocument();
    expect(screen.getByText("R$ 32,90")).toBeInTheDocument();
  });

  it("destaca o preço promocional e risca o original", () => {
    render(<ProductCard product={{ ...base, promo_price_cents: 1990 }} />);
    expect(screen.getByText("R$ 32,90")).toBeInTheDocument();
    expect(screen.getByText("R$ 19,90")).toBeInTheDocument();
  });

  it("marca o produto esgotado", () => {
    render(<ProductCard product={{ ...base, is_available: false }} />);
    expect(screen.getByText("unavailable")).toBeInTheDocument();
  });

  it("chama onDuplicate ao clicar em duplicar", () => {
    const onDuplicate = vi.fn();
    render(<ProductCard product={base} onDuplicate={onDuplicate} />);
    fireEvent.click(screen.getByRole("button", { name: "duplicate" }));
    expect(onDuplicate).toHaveBeenCalled();
  });

  it("renderiza a alça de arrastar quando fornecida", () => {
    render(<ProductCard product={base} dragHandle={<span>handle</span>} />);
    expect(screen.getByText("handle")).toBeInTheDocument();
  });
});
