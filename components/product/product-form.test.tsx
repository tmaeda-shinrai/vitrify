import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProductForm } from "@/components/product/product-form";
import type { CategoryItem, ProductListItem } from "@/lib/products";

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));
vi.mock("sonner", () => ({ toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() } }));

const createProductAction = vi.fn();
const updateProductAction = vi.fn();
vi.mock("@/app/(dashboard)/produtos/actions", () => ({
  createProductAction: (...args: unknown[]) => createProductAction(...args),
  updateProductAction: (...args: unknown[]) => updateProductAction(...args),
  createProductImageUploadUrl: vi.fn(),
}));

// Uploader simplificado: um botão que devolve uma URL de foto.
vi.mock("@/components/shared/image-uploader", () => ({
  ImageUploader: ({ onUploaded }: { onUploaded: (url: string) => void }) => (
    <button type="button" onClick={() => onUploaded("https://proj.supabase.co/p/u/a.webp")}>
      mock-upload
    </button>
  ),
}));

vi.mock("@/hooks/use-product-draft", () => ({
  useProductDraft: () => ({ initialDraft: null, save: vi.fn(), clear: vi.fn() }),
}));

const categories: CategoryItem[] = [{ id: "c1", name: "Maquiagem", display_order: 0 }];
const brandSuggestions = ["Avon", "Natura"];

const existing: ProductListItem = {
  id: "p9",
  name: "Antigo",
  description: "",
  price_cents: 1000,
  promo_price_cents: null,
  is_available: true,
  category_id: null,
  category_name: null,
  brand_id: null,
  brand_name: null,
  images: [{ url: "https://proj.supabase.co/p/u/a.webp", alt: "" }],
  cover_url: "https://proj.supabase.co/p/u/a.webp",
};

function renderForm(product?: ProductListItem, onSaved = vi.fn()) {
  return render(
    <ProductForm
      vitrineId="v1"
      product={product}
      categories={categories}
      brandSuggestions={brandSuggestions}
      onSaved={onSaved}
      onLimitReached={vi.fn()}
    />,
  );
}

describe("ProductForm (criação)", () => {
  it("bloqueia o envio vazio e não chama a action", async () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    expect(await screen.findByText("Informe o nome do produto.")).toBeInTheDocument();
    await waitFor(() => expect(createProductAction).not.toHaveBeenCalled());
  });

  it("envia preço em centavos e a marca digitada", async () => {
    createProductAction.mockResolvedValue({ ok: true, product: existing });
    const onSaved = vi.fn();

    renderForm(undefined, onSaved);
    fireEvent.change(screen.getByLabelText("nameLabel"), { target: { value: "Batom" } });
    fireEvent.change(screen.getByLabelText("priceLabel"), { target: { value: "32,90" } });
    fireEvent.change(screen.getByLabelText("brandLabel"), { target: { value: "Natura" } });
    fireEvent.click(screen.getByText("mock-upload"));
    fireEvent.click(screen.getByRole("button", { name: "save" }));

    await waitFor(() =>
      expect(createProductAction).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Batom", priceCents: 3290, brandName: "Natura" }),
      ),
    );
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
  });
});

describe("ProductForm (edição)", () => {
  it("prefilla e chama updateProductAction com o id", async () => {
    updateProductAction.mockResolvedValue({ ok: true, product: existing });
    const onSaved = vi.fn();

    renderForm(existing, onSaved);
    expect(screen.getByLabelText("nameLabel")).toHaveValue("Antigo");

    fireEvent.change(screen.getByLabelText("nameLabel"), { target: { value: "Novo nome" } });
    fireEvent.click(screen.getByRole("button", { name: "saveEdit" }));

    await waitFor(() =>
      expect(updateProductAction).toHaveBeenCalledWith(
        "p9",
        expect.objectContaining({ name: "Novo nome", priceCents: 1000 }),
      ),
    );
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
  });
});
