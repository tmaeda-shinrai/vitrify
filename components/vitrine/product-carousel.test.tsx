import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProductCarousel } from "@/components/vitrine/product-carousel";

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));

describe("ProductCarousel", () => {
  it("mostra placeholder quando não há fotos", () => {
    render(<ProductCarousel images={[]} alt="Produto" />);
    expect(screen.queryAllByRole("img")).toHaveLength(0);
  });

  it("renderiza todas as fotos e os controles quando há mais de uma", () => {
    render(<ProductCarousel images={["https://x/a.webp", "https://x/b.webp"]} alt="Produto" />);
    expect(screen.getAllByRole("img")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "prev" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "next" })).toBeInTheDocument();
  });

  it("não mostra setas com uma única foto", () => {
    render(<ProductCarousel images={["https://x/a.webp"]} alt="Produto" />);
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "prev" })).not.toBeInTheDocument();
  });
});
