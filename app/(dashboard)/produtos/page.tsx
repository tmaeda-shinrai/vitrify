import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProductsManager } from "@/components/product/products-manager";
import { clientEnv, serverEnv } from "@/lib/env";
import { PRODUCT_LIST_SELECT, toProductListItem } from "@/lib/products";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Produtos" };

export default async function ProdutosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: vitrine }, { data: subscription }, { data: suggestedRows }] = await Promise.all([
    supabase
      .from("vitrines")
      .select("id, slug")
      .eq("owner_id", user.id)
      .eq("is_default", true)
      .maybeSingle(),
    supabase.from("subscriptions").select("plan").eq("owner_id", user.id).maybeSingle(),
    supabase.from("suggested_brands").select("name").order("name", { ascending: true }),
  ]);

  if (!vitrine) redirect("/onboarding");

  // Escopa explicitamente por `vitrine_id`: a policy pública de `products` também vale
  // p/ usuárias autenticadas, então confiar só no RLS traria itens de outras vitrines
  // (inflando a contagem do limite Free e vazando produtos de terceiros no painel).
  const [{ data: rows }, { data: categoryRows }, { data: brandRows }] = await Promise.all([
    supabase
      .from("products")
      .select(PRODUCT_LIST_SELECT)
      .eq("vitrine_id", vitrine.id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("categories")
      .select("id, name, display_order")
      .eq("vitrine_id", vitrine.id)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("brands")
      .select("id, name")
      .eq("vitrine_id", vitrine.id)
      .order("name", { ascending: true }),
  ]);

  const initialProducts = (rows ?? []).map(toProductListItem);
  const initialCategories = (categoryRows ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    display_order: c.display_order ?? 0,
  }));
  const initialBrands = (brandRows ?? []).map((b) => ({ id: b.id, name: b.name }));
  const suggestedBrands = (suggestedRows ?? []).map((b) => b.name);
  const productLimit = subscription?.plan === "free" ? serverEnv.LIMIT_FREE_PRODUCTS : null;
  const shareUrl = `${clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/${vitrine.slug}`;

  return (
    <ProductsManager
      vitrineId={vitrine.id}
      shareUrl={shareUrl}
      initialProducts={initialProducts}
      initialCategories={initialCategories}
      initialBrands={initialBrands}
      suggestedBrands={suggestedBrands}
      productLimit={productLimit}
    />
  );
}
