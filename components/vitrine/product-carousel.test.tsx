import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProductCarousel } from "@/components/vitrine/product-carousel";

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));

const img = (url: string, alt = "") => ({ url, alt });

describe("ProductCarousel", () => {
  it("mostra placeholder quando não há fotos", () => {
    render(<ProductCarousel images={[]} alt="Produto" />);
    expect(screen.queryAllByRole("img")).toHaveLength(0);
  });

  it("renderiza todas as fotos e os controles quando há mais de uma", () => {
    render(
      <ProductCarousel images={[img("https://x/a.webp"), img("https://x/b.webp")]} alt="Produto" />,
    );
    expect(screen.getAllByRole("img")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "prev" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "next" })).toBeInTheDocument();
  });

  it("não mostra setas com uma única foto", () => {
    render(<ProductCarousel images={[img("https://x/a.webp")]} alt="Produto" />);
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "prev" })).not.toBeInTheDocument();
  });

  it("usa o alt próprio da foto e cai no fallback quando vazio", () => {
    render(
      <ProductCarousel
        images={[img("https://x/a.webp", "Frente do batom"), img("https://x/b.webp")]}
        alt="Batom"
      />,
    );
    const imgs = screen.getAllByRole("img");
    expect(imgs[0]).toHaveAttribute("alt", "Frente do batom");
    expect(imgs[1]).toHaveAttribute("alt", "Batom");
  });
});
