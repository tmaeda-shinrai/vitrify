import { ProductCard } from "@/components/product/product-card";
import type { ProductListItem } from "@/lib/products";

/**
 * Grid de produtos da vitrine pública: 2 colunas no mobile, 3–4 no desktop.
 * Reusa o `ProductCard` sem ações (sem `onEdit`/`onDelete` → só foto/nome/preço).
 * O modal de detalhe (clique) entra no PR2.
 */
export function VitrineGrid({
  products,
  emptyLabel,
}: {
  products: ProductListItem[];
  emptyLabel: string;
}) {
  if (products.length === 0) {
    return <p className="py-16 text-center text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
