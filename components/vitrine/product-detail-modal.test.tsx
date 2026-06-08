import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProductDetailModal } from "@/components/vitrine/product-detail-modal";
import type { ProductListItem } from "@/lib/products";

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));

const product: ProductListItem = {
  id: "p1",
  name: "Perfume Floral",
  description: "Notas de jasmim",
  price_cents: 8900,
  promo_price_cents: null,
  is_available: true,
  category_id: null,
  category_name: null,
  brand_id: null,
  brand_name: null,
  images: [{ url: "https://x/a.webp", alt: "" }],
  cover_url: "https://x/a.webp",
};

const baseProps = {
  onOpenChange: () => {},
  whatsapp: "5511999998888",
  ownerName: "Maria Silva",
  vitrineUrl: "https://vitrinio.com.br/maria",
  slug: "maria",
};

describe("ProductDetailModal", () => {
  it("fica fechado quando product é null", () => {
    render(<ProductDetailModal product={null} {...baseProps} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("mostra nome, preço, descrição e CTA do WhatsApp", () => {
    render(<ProductDetailModal product={product} {...baseProps} />);
    expect(screen.getByText("Perfume Floral")).toBeInTheDocument();
    expect(screen.getByText("R$ 89,00")).toBeInTheDocument();
    expect(screen.getByText("Notas de jasmim")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "order" }).getAttribute("href")).toContain(
      "https://wa.me/5511999998888?text=",
    );
  });

  it("desabilita o CTA quando o produto está esgotado", () => {
    render(<ProductDetailModal product={{ ...product, is_available: false }} {...baseProps} />);
    expect(screen.queryByRole("link", { name: "order" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "unavailable" })).toBeDisabled();
  });
});
