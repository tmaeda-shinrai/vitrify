"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { ProductCard } from "@/components/product/product-card";
import { ProductDetailModal } from "@/components/vitrine/product-detail-modal";
import { WhatsAppButton } from "@/components/vitrine/whatsapp-button";
import type { ProductListItem } from "@/lib/products";
import { buildProductMessage } from "@/lib/whatsapp";

interface Props {
  products: ProductListItem[];
  whatsapp: string | null;
  ownerName: string | null;
  vitrineUrl: string;
  slug: string;
}

/**
 * Grid de produtos da vitrine pública: 2 colunas no mobile, 3–4 no desktop.
 * Cada `ProductCard` abre o modal (toque na mídia/info) e tem o `WhatsAppButton`
 * no rodapé; o modal repete o CTA. Esgotado desabilita o botão de pedido.
 */
export function VitrineGrid({ products, whatsapp, ownerName, vitrineUrl, slug }: Props) {
  const t = useTranslations("vitrine");
  const [selected, setSelected] = useState<ProductListItem | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpen={() => setSelected(product)}
            action={
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
                intent={{ slug, productId: product.id, source: "card" }}
              />
            }
          />
        ))}
      </div>

      <ProductDetailModal
        product={selected}
        onOpenChange={() => setSelected(null)}
        whatsapp={whatsapp}
        ownerName={ownerName}
        vitrineUrl={vitrineUrl}
        slug={slug}
      />
    </>
  );
}
