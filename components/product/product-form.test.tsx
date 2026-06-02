import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProductForm } from "@/components/product/product-form";

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));
vi.mock("sonner", () => ({ toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() } }));

const createProductAction = vi.fn();
vi.mock("@/app/(dashboard)/produtos/actions", () => ({
  createProductAction: (...args: unknown[]) => createProductAction(...args),
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

describe("ProductForm", () => {
  it("bloqueia o envio vazio e não chama a action", async () => {
    render(<ProductForm vitrineId="v1" onCreated={vi.fn()} onLimitReached={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    expect(await screen.findByText("Informe o nome do produto.")).toBeInTheDocument();
    await waitFor(() => expect(createProductAction).not.toHaveBeenCalled());
  });

  it("envia preço em centavos no caminho feliz", async () => {
    createProductAction.mockResolvedValue({
      ok: true,
      product: {
        id: "p1",
        name: "Batom",
        price_cents: 3290,
        promo_price_cents: null,
        is_available: true,
        cover_url: "https://proj.supabase.co/p/u/a.webp",
      },
    });
    const onCreated = vi.fn();

    render(<ProductForm vitrineId="v1" onCreated={onCreated} onLimitReached={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("nameLabel"), { target: { value: "Batom" } });
    fireEvent.change(screen.getByLabelText("priceLabel"), { target: { value: "32,90" } });
    fireEvent.click(screen.getByText("mock-upload"));
    fireEvent.click(screen.getByRole("button", { name: "save" }));

    await waitFor(() =>
      expect(createProductAction).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Batom", priceCents: 3290 }),
      ),
    );
    await waitFor(() => expect(onCreated).toHaveBeenCalled());
  });
});
