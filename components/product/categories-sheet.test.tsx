import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CategoriesSheet } from "@/components/product/categories-sheet";
import type { CategoryItem } from "@/lib/products";

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const createCategoryAction = vi.fn();
vi.mock("@/app/(dashboard)/produtos/category-actions", () => ({
  createCategoryAction: (...args: unknown[]) => createCategoryAction(...args),
  renameCategoryAction: vi.fn(),
  deleteCategoryAction: vi.fn(),
  reorderCategoriesAction: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

const categories: CategoryItem[] = [
  { id: "c1", name: "Maquiagem", display_order: 0 },
  { id: "c2", name: "Perfumes", display_order: 1 },
];

describe("CategoriesSheet", () => {
  it("lista as categorias existentes", () => {
    render(<CategoriesSheet open onOpenChange={vi.fn()} categories={categories} />);
    expect(screen.getByDisplayValue("Maquiagem")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Perfumes")).toBeInTheDocument();
  });

  it("cria uma categoria nova", async () => {
    createCategoryAction.mockResolvedValue({
      ok: true,
      category: { id: "c3", name: "Cabelos", display_order: 2 },
    });
    render(<CategoriesSheet open onOpenChange={vi.fn()} categories={categories} />);

    fireEvent.change(screen.getByPlaceholderText("newCategoryPlaceholder"), {
      target: { value: "Cabelos" },
    });
    fireEvent.click(screen.getByRole("button", { name: "addCategory" }));

    await waitFor(() => expect(createCategoryAction).toHaveBeenCalledWith("Cabelos"));
  });
});
