import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProductsManager } from "@/components/product/products-manager";
import { serverEnv } from "@/lib/env";
import { PRODUCT_LIST_SELECT, toProductListItem } from "@/lib/products";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Produtos" };

export default async function ProdutosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS restringe os produtos à dona; a vitrine padrão recebe os novos cadastros.
  const [{ data: vitrine }, { data: subscription }, { data: rows }] = await Promise.all([
    supabase
      .from("vitrines")
      .select("id")
      .eq("owner_id", user.id)
      .eq("is_default", true)
      .maybeSingle(),
    supabase.from("subscriptions").select("plan").eq("owner_id", user.id).maybeSingle(),
    supabase
      .from("products")
      .select(PRODUCT_LIST_SELECT)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (!vitrine) redirect("/onboarding");

  const initialProducts = (rows ?? []).map(toProductListItem);
  const productLimit = subscription?.plan === "free" ? serverEnv.LIMIT_FREE_PRODUCTS : null;

  return (
    <ProductsManager
      vitrineId={vitrine.id}
      initialProducts={initialProducts}
      productLimit={productLimit}
    />
  );
}
