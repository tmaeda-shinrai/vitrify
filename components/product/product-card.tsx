"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Copy, ImageOff, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/money";
import type { ProductListItem } from "@/lib/products";

interface Props {
  product: ProductListItem;
  /** Abre o detalhe (vitrine pública). Quando definido, a mídia+info vira um botão. */
  onOpen?: () => void;
  /** Ação no rodapé do card (ex.: `WhatsAppButton` na vitrine pública). */
  action?: ReactNode;
  /** Ações de gestão (ausentes na vitrine pública). */
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  /** Alça de arrastar (injetada pelo SortableProductCard). */
  dragHandle?: ReactNode;
}

export function ProductCard({
  product,
  onOpen,
  action,
  onEdit,
  onDuplicate,
  onDelete,
  dragHandle,
}: Props) {
  const t = useTranslations("produtos");
  const hasPromo =
    product.promo_price_cents !== null && product.promo_price_cents < product.price_cents;

  const media = (
    <>
      <div className="relative aspect-square w-full bg-muted">
        {product.cover_url ? (
          <Image
            src={product.cover_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 200px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
            <ImageOff className="size-8" />
            <span className="text-xs">{t("noPhoto")}</span>
          </div>
        )}
        {!product.is_available ? (
          <Badge variant="secondary" className="absolute left-2 top-2">
            {t("unavailable")}
          </Badge>
        ) : null}
      </div>

      <div className="space-y-1 p-3">
        <p className="line-clamp-2 text-sm font-medium">{product.name}</p>
        {hasPromo ? (
          <p className="text-sm">
            <span className="text-muted-foreground line-through">
              {formatBRL(product.price_cents)}
            </span>{" "}
            <span className="font-semibold text-brand-secondary">
              {formatBRL(product.promo_price_cents as number)}
            </span>
          </p>
        ) : (
          <p className="text-sm font-semibold">{formatBRL(product.price_cents)}</p>
        )}

        {product.category_name || product.brand_name ? (
          <p className="truncate text-xs text-muted-foreground">
            {[product.category_name, product.brand_name].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </div>
    </>
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border bg-card">
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          {media}
        </button>
      ) : (
        media
      )}

      {action ? <div className="px-3 pb-3">{action}</div> : null}

      {onEdit || onDuplicate || onDelete || dragHandle ? (
        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center">{dragHandle}</div>
          <div className="flex gap-1">
            {onEdit ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={t("edit")}
                onClick={onEdit}
              >
                <Pencil className="size-4" />
              </Button>
            ) : null}
            {onDuplicate ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={t("duplicate")}
                onClick={onDuplicate}
              >
                <Copy className="size-4" />
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-destructive hover:text-destructive"
                aria-label={t("delete")}
                onClick={onDelete}
              >
                <Trash2 className="size-4" />
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
