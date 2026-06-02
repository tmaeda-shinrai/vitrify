"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/money";
import type { ProductListItem } from "@/lib/products";

export function ProductCard({ product }: { product: ProductListItem }) {
  const t = useTranslations("produtos");
  const hasPromo =
    product.promo_price_cents !== null && product.promo_price_cents < product.price_cents;

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
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
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-8" />
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
      </div>
    </div>
  );
}
