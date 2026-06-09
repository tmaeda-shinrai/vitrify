"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { FolderTree, Package, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { duplicateProductAction, reorderProductsAction } from "@/app/(dashboard)/produtos/actions";
import { CategoriesSheet } from "@/components/product/categories-sheet";
import { DeleteProductDialog } from "@/components/product/delete-product-dialog";
import { ProductForm } from "@/components/product/product-form";
import { SortableProductCard } from "@/components/product/sortable-product-card";
import { UpgradeModal } from "@/components/product/upgrade-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ShareButton } from "@/components/shared/share-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BRANDS_QUERY_KEY, useBrands } from "@/hooks/use-brands";
import { useCategories } from "@/hooks/use-categories";
import { PRODUCTS_QUERY_KEY, useProducts } from "@/hooks/use-products";
import { trackEvent } from "@/lib/analytics/plausible";
import { moveById, type BrandItem, type CategoryItem, type ProductListItem } from "@/lib/products";
import { cn } from "@/lib/utils";

interface Props {
  vitrineId: string;
  shareUrl: string;
  initialProducts: ProductListItem[];
  initialCategories: CategoryItem[];
  initialBrands: BrandItem[];
  suggestedBrands: string[];
  /** Limite de produtos do plano; `null` = ilimitado (Pro/Plus). */
  productLimit: number | null;
}

export function ProductsManager({
  vitrineId,
  shareUrl,
  initialProducts,
  initialCategories,
  initialBrands,
  suggestedBrands,
  productLimit,
}: Props) {
  const t = useTranslations("produtos");
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: products } = useProducts(initialProducts, vitrineId);
  const { data: categories } = useCategories(initialCategories);
  const { data: brands } = useBrands(initialBrands);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProductListItem | null>(null);
  const [deleting, setDeleting] = useState<ProductListItem | null>(null);
  const [limitOpen, setLimitOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const atLimit = productLimit !== null && products.length >= productLimit;

  const brandSuggestions = useMemo(() => {
    const names = new Set<string>([...brands.map((b) => b.name), ...suggestedBrands]);
    return [...names].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [brands, suggestedBrands]);

  function handleAdd() {
    if (atLimit) {
      setLimitOpen(true);
      return;
    }
    setEditing(null);
    setFormOpen(true);
  }

  function handleEdit(product: ProductListItem) {
    setEditing(product);
    setFormOpen(true);
  }

  function handleSaved(product: ProductListItem) {
    const isNew = !products.some((p) => p.id === product.id);
    queryClient.setQueryData<ProductListItem[]>(PRODUCTS_QUERY_KEY, (old = []) => {
      const exists = old.some((p) => p.id === product.id);
      return exists ? old.map((p) => (p.id === product.id ? product : p)) : [product, ...old];
    });
    void queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: BRANDS_QUERY_KEY });
    if (isNew) trackEvent("Product created", { total: products.length + 1 });
    setFormOpen(false);
    setEditing(null);
  }

  function handleDeleted(productId: string) {
    queryClient.setQueryData<ProductListItem[]>(PRODUCTS_QUERY_KEY, (old = []) =>
      old.filter((p) => p.id !== productId),
    );
    void queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    setDeleting(null);
  }

  async function handleDuplicate(product: ProductListItem) {
    const result = await duplicateProductAction(product.id);
    if (!result.ok) {
      if (result.code === "PLAN_LIMIT_REACHED") {
        setLimitOpen(true);
        return;
      }
      toast.error(result.error ?? t("genericError"));
      return;
    }
    queryClient.setQueryData<ProductListItem[]>(PRODUCTS_QUERY_KEY, (old = []) => [
      result.product!,
      ...old,
    ]);
    void queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    trackEvent("Product created", { total: products.length + 1, source: "duplicate" });
    toast.success(t("duplicated"));
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const next = moveById(products, String(active.id), String(over.id));
    queryClient.setQueryData<ProductListItem[]>(PRODUCTS_QUERY_KEY, next);

    const result = await reorderProductsAction(next.map((p) => p.id));
    if (!result.ok) {
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      toast.error(t("reorderError"));
    }
  }

  function handleLimitReached() {
    setFormOpen(false);
    setLimitOpen(true);
  }

  // Atalho do PWA "Adicionar produto" (#0017): abre o formulário ao chegar com ?novo=1.
  useEffect(() => {
    if (searchParams.get("novo") !== "1") return;
    handleAdd();
    window.history.replaceState(null, "", "/produtos");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("count", { count: products.length })}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <ShareButton url={shareUrl} label={t("shareVitrine")} size="icon" />
          <Button variant="outline" onClick={() => setCategoriesOpen(true)}>
            <FolderTree className="size-4" />
            <span className="hidden sm:inline">{t("manageCategories")}</span>
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="size-4" />
            <span className="hidden sm:inline">{t("addProduct")}</span>
          </Button>
        </div>
      </header>

      {productLimit !== null ? (
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm",
            atLimit ? "border-primary/40 bg-primary/5" : "border-input bg-muted/40",
          )}
        >
          <span className={atLimit ? "font-medium" : "text-muted-foreground"}>
            {atLimit
              ? t("limitBannerReached", { limit: productLimit })
              : t("limitBannerCount", { count: products.length, limit: productLimit })}
          </span>
          <Button asChild size="sm" variant={atLimit ? "default" : "outline"}>
            <Link href="/assinar">{t("limitBannerCta")}</Link>
          </Button>
        </div>
      ) : null}

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          action={<Button onClick={handleAdd}>{t("addProduct")}</Button>}
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={products.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <SortableProductCard
                  key={product.id}
                  product={product}
                  onEdit={() => handleEdit(product)}
                  onDuplicate={() => handleDuplicate(product)}
                  onDelete={() => setDeleting(product)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editing ? t("editTitle") : t("formTitle")}</SheetTitle>
            <SheetDescription>
              {editing ? t("editDescription") : t("formDescription")}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {formOpen ? (
              <ProductForm
                key={editing?.id ?? "new"}
                vitrineId={vitrineId}
                product={editing}
                categories={categories}
                brandSuggestions={brandSuggestions}
                onSaved={handleSaved}
                onLimitReached={handleLimitReached}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <CategoriesSheet
        open={categoriesOpen}
        onOpenChange={setCategoriesOpen}
        categories={categories}
      />

      <DeleteProductDialog
        product={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onDeleted={handleDeleted}
      />

      <UpgradeModal open={limitOpen} onOpenChange={setLimitOpen} />
    </div>
  );
}
