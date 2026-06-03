import { getTranslations } from "next-intl/server";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TopProductRow } from "@/lib/stats";

/**
 * Ranking dos produtos mais procurados (cliques em "Pedir no WhatsApp"). Server
 * Component sem interação; recebe a lista já ordenada por `topProductsByIntents`.
 */
export async function TopProducts({ products }: { products: TopProductRow[] }) {
  const t = await getTranslations("estatisticas");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("topProductsTitle")}</CardTitle>
        <CardDescription>{t("topProductsHint")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2">
          {products.map((product, index) => (
            <li key={product.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {index + 1}
                </span>
                <span className="truncate">{product.name}</span>
              </span>
              <span className="shrink-0 font-medium tabular-nums">
                {t("clicks", { count: product.intents })}
              </span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
