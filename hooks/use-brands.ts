"use client";

import { useQuery } from "@tanstack/react-query";

import type { BrandItem } from "@/lib/products";
import { createClient } from "@/lib/supabase/browser";

export const BRANDS_QUERY_KEY = ["brands"] as const;

/** Marcas já cadastradas na vitrine da dona. RLS já restringe ao dono. */
export function useBrands(initialData: BrandItem[]) {
  return useQuery<BrandItem[]>({
    queryKey: BRANDS_QUERY_KEY,
    initialData,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("brands")
        .select("id, name")
        .order("name", { ascending: true });
      if (error || !data) return [];
      return data.map((b) => ({ id: b.id, name: b.name }));
    },
  });
}
