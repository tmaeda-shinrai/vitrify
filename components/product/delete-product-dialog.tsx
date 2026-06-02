"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { deleteProductAction } from "@/app/(dashboard)/produtos/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProductListItem } from "@/lib/products";

interface Props {
  /** Produto a excluir; `null` mantém o diálogo fechado. */
  product: ProductListItem | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: (productId: string) => void;
}

export function DeleteProductDialog({ product, onOpenChange, onDeleted }: Props) {
  const t = useTranslations("produtos");
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!product) return;
    setDeleting(true);
    const result = await deleteProductAction(product.id);
    setDeleting(false);
    if (!result.ok) {
      toast.error(result.error ?? t("genericError"));
      return;
    }
    toast.success(t("deleted"));
    onDeleted(product.id);
  }

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onOpenChange(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("deleteTitle")}</DialogTitle>
          <DialogDescription>
            {t("deleteDescription", { name: product?.name ?? "" })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={deleting}>
            {t("cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("deleteConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
