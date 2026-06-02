"use server";

import { revalidatePath } from "next/cache";

import type { CategoryItem } from "@/lib/products";
import { createClient } from "@/lib/supabase/server";
import { categoryNameSchema } from "@/lib/validators/product";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

export interface CategoryActionResult {
  ok: boolean;
  error?: string;
  category?: CategoryItem;
}

const DUPLICATE = "Já existe uma categoria com esse nome.";

/** Vitrine padrão da dona (`{ id, slug }`) ou `null` se não autenticada. */
async function ownerVitrine(supabase: SupabaseServer) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("vitrines")
    .select("id, slug")
    .eq("owner_id", user.id)
    .eq("is_default", true)
    .maybeSingle();
  return data;
}

export async function createCategoryAction(name: unknown): Promise<CategoryActionResult> {
  const parsed = categoryNameSchema.safeParse(name);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Nome inválido." };
  }

  const supabase = await createClient();
  const vitrine = await ownerVitrine(supabase);
  if (!vitrine) return { ok: false, error: "Vitrine não encontrada." };

  const { data: last } = await supabase
    .from("categories")
    .select("display_order")
    .eq("vitrine_id", vitrine.id)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (last?.display_order ?? 0) + 1;

  const { data, error } = await supabase
    .from("categories")
    .insert({ vitrine_id: vitrine.id, name: parsed.data, display_order: nextOrder })
    .select("id, name, display_order")
    .single();
  if (error || !data) {
    if (error?.code === "23505") return { ok: false, error: DUPLICATE };
    return { ok: false, error: "Não foi possível criar a categoria." };
  }

  revalidatePath(`/${vitrine.slug}`);
  return {
    ok: true,
    category: { id: data.id, name: data.name, display_order: data.display_order ?? nextOrder },
  };
}

export async function renameCategoryAction(
  id: string,
  name: unknown,
): Promise<CategoryActionResult> {
  const parsed = categoryNameSchema.safeParse(name);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Nome inválido." };
  }

  const supabase = await createClient();
  const vitrine = await ownerVitrine(supabase);
  if (!vitrine) return { ok: false, error: "Vitrine não encontrada." };

  const { data, error } = await supabase
    .from("categories")
    .update({ name: parsed.data })
    .eq("id", id)
    .select("id, name, display_order")
    .single();
  if (error || !data) {
    if (error?.code === "23505") return { ok: false, error: DUPLICATE };
    return { ok: false, error: "Não foi possível renomear a categoria." };
  }

  revalidatePath(`/${vitrine.slug}`);
  return {
    ok: true,
    category: { id: data.id, name: data.name, display_order: data.display_order ?? 0 },
  };
}

export async function deleteCategoryAction(id: string): Promise<CategoryActionResult> {
  const supabase = await createClient();
  const vitrine = await ownerVitrine(supabase);
  if (!vitrine) return { ok: false, error: "Vitrine não encontrada." };

  // FK products.category_id ON DELETE SET NULL: produtos não são apagados.
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: "Não foi possível excluir a categoria." };

  revalidatePath(`/${vitrine.slug}`);
  return { ok: true };
}

export async function reorderCategoriesAction(orderedIds: string[]): Promise<CategoryActionResult> {
  const supabase = await createClient();
  const vitrine = await ownerVitrine(supabase);
  if (!vitrine) return { ok: false, error: "Vitrine não encontrada." };

  // display_order = índice na lista. RLS restringe às categorias da dona.
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("categories")
        .update({ display_order: index })
        .eq("id", id)
        .eq("vitrine_id", vitrine.id),
    ),
  );

  revalidatePath(`/${vitrine.slug}`);
  return { ok: true };
}
