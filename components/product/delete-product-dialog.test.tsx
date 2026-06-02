import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DeleteProductDialog } from "@/components/product/delete-product-dialog";
import type { ProductListItem } from "@/lib/products";

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const deleteProductAction = vi.fn();
vi.mock("@/app/(dashboard)/produtos/actions", () => ({
  deleteProductAction: (...args: unknown[]) => deleteProductAction(...args),
}));

const product: ProductListItem = {
  id: "p1",
  name: "Batom",
  description: null,
  price_cents: 3290,
  promo_price_cents: null,
  is_available: true,
  category_id: null,
  category_name: null,
  brand_id: null,
  brand_name: null,
  cover_url: null,
};

describe("DeleteProductDialog", () => {
  it("confirma a exclusão e chama a action com o id", async () => {
    deleteProductAction.mockResolvedValue({ ok: true });
    const onDeleted = vi.fn();
    render(<DeleteProductDialog product={product} onOpenChange={vi.fn()} onDeleted={onDeleted} />);

    fireEvent.click(screen.getByRole("button", { name: "deleteConfirm" }));

    await waitFor(() => expect(deleteProductAction).toHaveBeenCalledWith("p1"));
    await waitFor(() => expect(onDeleted).toHaveBeenCalledWith("p1"));
  });

  it("fica fechado quando não há produto", () => {
    render(<DeleteProductDialog product={null} onOpenChange={vi.fn()} onDeleted={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "deleteConfirm" })).not.toBeInTheDocument();
  });
});
