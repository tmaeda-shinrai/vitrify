"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { ProductCard } from "@/components/product/product-card";
import { ProductDetailModal } from "@/components/vitrine/product-detail-modal";
import type { ProductListItem } from "@/lib/products";

/**
 * Grid de produtos da vitrine pública: 2 colunas no mobile, 3–4 no desktop.
 * Reusa o `ProductCard` (sem ações) dentro de um botão que abre o modal de
 * detalhe. O CTA de WhatsApp do modal usa o número da dona (`whatsappNumber`).
 */
export function VitrineGrid({
  products,
  whatsappNumber,
}: {
  products: ProductListItem[];
  whatsappNumber: string | null;
}) {
  const t = useTranslations("vitrine");
  const [selected, setSelected] = useState<ProductListItem | null>(null);

  if (products.length === 0) {
    return <p className="py-16 text-center text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => setSelected(product)}
            className="w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ProductCard product={product} />
          </button>
        ))}
      </div>

      <ProductDetailModal
        product={selected}
        onOpenChange={() => setSelected(null)}
        whatsappNumber={whatsappNumber}
      />
    </>
  );
}
