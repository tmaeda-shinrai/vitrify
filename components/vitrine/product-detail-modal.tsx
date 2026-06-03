"use client";

import { useTranslations } from "next-intl";

import { ProductCarousel } from "@/components/vitrine/product-carousel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatBRL } from "@/lib/money";
import type { ProductListItem } from "@/lib/products";

interface Props {
  /** Produto aberto; `null` mantém o modal fechado. */
  product: ProductListItem | null;
  onOpenChange: (open: boolean) => void;
  /** WhatsApp da dona em E.164 sem `+` (ex.: 5511999998888); `null` esconde o CTA. */
  whatsappNumber: string | null;
}

export function ProductDetailModal({ product, onOpenChange, whatsappNumber }: Props) {
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

              {/* CTA: link wa.me básico. #0013 troca por mensagem pré-preenchida + intent. */}
              {whatsappNumber ? (
                <Button asChild className="w-full bg-whatsapp text-white hover:bg-whatsapp/90">
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("order")}
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
