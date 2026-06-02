"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Package, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { DeleteProductDialog } from "@/components/product/delete-product-dialog";
import { ProductCard } from "@/components/product/product-card";
import { ProductForm } from "@/components/product/product-form";
import { UpgradeModal } from "@/components/product/upgrade-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PRODUCTS_QUERY_KEY, useProducts } from "@/hooks/use-products";
import type { ProductListItem } from "@/lib/products";

interface Props {
  vitrineId: string;
  initialProducts: ProductListItem[];
  /** Limite de produtos do plano; `null` = ilimitado (Pro/Plus). */
  productLimit: number | null;
}

export function ProductsManager({ vitrineId, initialProducts, productLimit }: Props) {
  const t = useTranslations("produtos");
  const queryClient = useQueryClient();
  const { data: products } = useProducts(initialProducts);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProductListItem | null>(null);
  const [deleting, setDeleting] = useState<ProductListItem | null>(null);
  const [limitOpen, setLimitOpen] = useState(false);

  const atLimit = productLimit !== null && products.length >= productLimit;

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
    queryClient.setQueryData<ProductListItem[]>(PRODUCTS_QUERY_KEY, (old = []) => {
      const exists = old.some((p) => p.id === product.id);
      return exists ? old.map((p) => (p.id === product.id ? product : p)) : [product, ...old];
    });
    void queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
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

  function handleLimitReached() {
    setFormOpen(false);
    setLimitOpen(true);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("count", { count: products.length })}</p>
        </div>
        <Button onClick={handleAdd} className="shrink-0">
          <Plus className="size-4" />
          <span className="hidden sm:inline">{t("addProduct")}</span>
        </Button>
      </header>

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          action={<Button onClick={handleAdd}>{t("addProduct")}</Button>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => handleEdit(product)}
              onDelete={() => setDeleting(product)}
            />
          ))}
        </div>
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
                onSaved={handleSaved}
                onLimitReached={handleLimitReached}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <DeleteProductDialog
        product={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onDeleted={handleDeleted}
      />

      <UpgradeModal open={limitOpen} onOpenChange={setLimitOpen} />
    </div>
  );
}
