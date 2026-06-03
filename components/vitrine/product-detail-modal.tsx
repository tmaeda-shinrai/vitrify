"use client";

import { useTranslations } from "next-intl";

import { ProductCarousel } from "@/components/vitrine/product-carousel";
import { WhatsAppButton } from "@/components/vitrine/whatsapp-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatBRL } from "@/lib/money";
import type { ProductListItem } from "@/lib/products";
import { buildProductMessage } from "@/lib/whatsapp";

interface Props {
  /** Produto aberto; `null` mantém o modal fechado. */
  product: ProductListItem | null;
  onOpenChange: (open: boolean) => void;
  whatsapp: string | null;
  ownerName: string | null;
  vitrineUrl: string;
  slug: string;
}

export function ProductDetailModal({
  product,
  onOpenChange,
  whatsapp,
  ownerName,
  vitrineUrl,
  slug,
}: Props) {
  const t = useTranslations("vitrine");
  const hasPromo =
    product?.promo_price_cents != null && product.promo_price_cents < product.price_cents;

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onOpenChange(false)}>
      <DialogContent className="max-w-md gap-0 p-0">
        {product ? (
          <div className="flex flex-col">
            <div className="p-4 pb-0">
              <ProductCarousel images={product.images} alt={product.name} />
            </div>

            <div className="space-y-3 p-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-left text-lg">{product.name}</DialogTitle>
                {hasPromo ? (
                  <p>
                    <span className="text-muted-foreground line-through">
                      {formatBRL(product.price_cents)}
                    </span>{" "}
                    <span className="text-lg font-semibold text-brand-secondary">
                      {formatBRL(product.promo_price_cents as number)}
                    </span>
                  </p>
                ) : (
                  <p className="text-lg font-semibold">{formatBRL(product.price_cents)}</p>
                )}
              </DialogHeader>

              {product.description ? (
                <p className="whitespace-pre-line text-sm text-foreground/80">
                  {product.description}
                </p>
              ) : null}

              <WhatsAppButton
                whatsapp={whatsapp}
                message={buildProductMessage({
                  ownerName,
                  productName: product.name,
                  priceCents: product.price_cents,
                  promoPriceCents: product.promo_price_cents,
                  vitrineUrl,
                })}
                label={t("order")}
                disabled={!product.is_available}
                disabledLabel={t("unavailable")}
                intent={{ slug, productId: product.id, source: "modal" }}
              />
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
