"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { nameStepSchema, slugStepSchema, whatsappStepSchema } from "@/lib/validators/onboarding";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

async function requireUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function saveNameAction(input: unknown): Promise<ActionResult> {
  const parsed = nameStepSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Informe um nome válido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sessão expirada. Entre novamente." };

  const fullName = parsed.data.fullName;
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);
  if (profileError) return { ok: false, error: "Não foi possível salvar. Tente novamente." };

  const firstName = fullName.split(" ")[0];
  await supabase
    .from("vitrines")
    .update({ title: `Vitrine de ${firstName}` })
    .eq("owner_id", user.id)
    .eq("is_default", true);

  return { ok: true };
}

export async function saveSlugAction(input: unknown): Promise<ActionResult> {
  const parsed = slugStepSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "@ inválido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sessão expirada. Entre novamente." };

  const slug = parsed.data.slug;

  const { data: available } = await supabase.rpc("is_slug_available", { p_slug: slug });
  if (available === false) return { ok: false, error: "Esse @ já está em uso." };

  const { error } = await supabase
    .from("vitrines")
    .update({ slug })
    .eq("owner_id", user.id)
    .eq("is_default", true);

  if (error) {
    // 23505 = unique_violation (corrida na reserva do slug).
    if (error.code === "23505") return { ok: false, error: "Esse @ já está em uso." };
    return { ok: false, error: "Não foi possível salvar o @. Tente novamente." };
  }

  return { ok: true };
}

export async function saveWhatsappAction(input: unknown): Promise<ActionResult> {
  const parsed = whatsappStepSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "WhatsApp inválido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sessão expirada. Entre novamente." };

  const { error } = await supabase
    .from("profiles")
    .update({ whatsapp: parsed.data.whatsapp })
    .eq("id", user.id);
  if (error) return { ok: false, error: "Não foi possível salvar. Tente novamente." };

  return { ok: true };
}

export async function saveAvatarAction(url: string | null): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "Sessão expirada. Entre novamente." };

  // Apenas pré-preenchimento do avatar do Google (URL https). Upload manual → #0009.
  const value = url && /^https:\/\//.test(url) ? url : null;

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ avatar_url: value }).eq("id", userId);
  if (error) return { ok: false, error: "Não foi possível salvar a foto. Tente novamente." };

  return { ok: true };
}

export async function completeOnboardingAction(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sessão expirada. Entre novamente." };

  const [{ data: profile }, { data: vitrine }] = await Promise.all([
    supabase.from("profiles").select("full_name, whatsapp").eq("id", user.id).maybeSingle(),
    supabase
      .from("vitrines")
      .select("id, slug")
      .eq("owner_id", user.id)
      .eq("is_default", true)
      .maybeSingle(),
  ]);

  if (!profile?.full_name) return { ok: false, error: "Preencha seu nome." };
  if (!profile.whatsapp) return { ok: false, error: "Preencha seu WhatsApp." };
  if (!vitrine?.slug || vitrine.slug.startsWith("u-")) {
    return { ok: false, error: "Escolha o @ da sua vitrine." };
  }

  const [{ error: profileError }, { error: vitrineError }] = await Promise.all([
    supabase
      .from("profiles")
      .update({ onboarding_completed_at: new Date().toISOString() })
      .eq("id", user.id),
    supabase.from("vitrines").update({ is_active: true }).eq("id", vitrine.id),
  ]);

  if (profileError || vitrineError) {
    return { ok: false, error: "Não foi possível concluir. Tente novamente." };
  }

  redirect("/produtos");
}
