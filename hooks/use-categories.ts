"use client";

import { useQuery } from "@tanstack/react-query";

import type { CategoryItem } from "@/lib/products";
import { createClient } from "@/lib/supabase/browser";

export const CATEGORIES_QUERY_KEY = ["categories"] as const;

/** Categorias da vitrine da dona, ordenadas. RLS já restringe ao dono. */
export function useCategories(initialData: CategoryItem[]) {
  return useQuery<CategoryItem[]>({
    queryKey: CATEGORIES_QUERY_KEY,
    initialData,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, display_order")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });
      if (error || !data) return [];
      return data.map((c) => ({ id: c.id, name: c.name, display_order: c.display_order ?? 0 }));
    },
  });
}
