"use client";

import { useQuery } from "@tanstack/react-query";

import { PRODUCT_LIST_SELECT, toProductListItem, type ProductListItem } from "@/lib/products";
import { createClient } from "@/lib/supabase/browser";

export const PRODUCTS_QUERY_KEY = ["products"] as const;

/**
 * Produtos da vitrine da dona, com a foto de capa. `initialData` vem do Server
 * Component (sem flash); a query revalida e o cache é invalidado após criar.
 * RLS já restringe ao dono.
 */
export function useProducts(initialData: ProductListItem[]) {
  return useQuery<ProductListItem[]>({
    queryKey: PRODUCTS_QUERY_KEY,
    initialData,
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_LIST_SELECT)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(100);
      if (error || !data) return [];

      return data.map(toProductListItem);
    },
  });
}
