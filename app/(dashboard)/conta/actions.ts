"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { sendEmail } from "@/lib/email/client";
import { accountDeletionRequestedEmail } from "@/lib/email/templates";
import { type SignedUpload } from "@/lib/image";
import { isReservedSlug } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, vitrineSchema } from "@/lib/validators/profile";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const AVATARS_BUCKET = "avatars";

/** Emite uma signed URL para upload do avatar (sempre .webp) na pasta do dono. */
export async function createAvatarUploadUrl(): Promise<SignedUpload> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sessão expirada. Entre novamente." };

  const path = `${user.id}/avatar-${Date.now()}.webp`;
  const { data, error } = await supabase.storage.from(AVATARS_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: "Não foi possível iniciar o upload." };

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);

  return { ok: true, path: data.path, token: data.token, publicUrl };
}

async function ownerSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("vitrines")
    .select("slug")
    .eq("owner_id", userId)
    .eq("is_default", true)
    .maybeSingle();
  return data?.slug ?? null;
}

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sessão expirada. Entre novamente." };

  const { fullName, bio, whatsapp, avatarUrl } = parsed.data;
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      bio: bio ? bio : null,
      whatsapp,
      avatar_url: avatarUrl ?? null,
    })
    .eq("id", user.id);
  if (error) return { ok: false, error: "Não foi possível salvar. Tente novamente." };

  const slug = await ownerSlug(supabase, user.id);
  if (slug) revalidatePath(`/${slug}`);

  return { ok: true };
}

export async function updateVitrineAction(input: unknown): Promise<ActionResult> {
  const parsed = vitrineSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sessão expirada. Entre novamente." };

  const { slug, title, subtitle } = parsed.data;
  if (isReservedSlug(slug)) return { ok: false, error: "Esse @ é reservado. Escolha outro." };

  const previousSlug = await ownerSlug(supabase, user.id);

  if (slug !== previousSlug) {
    const { data: available } = await supabase.rpc("is_slug_available", { p_slug: slug });
    if (available === false) return { ok: false, error: "Esse @ já está em uso." };
  }

  const { error } = await supabase
    .from("vitrines")
    .update({ slug, title, subtitle: subtitle ? subtitle : null })
    .eq("owner_id", user.id)
    .eq("is_default", true);

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Esse @ já está em uso." };
    return { ok: false, error: "Não foi possível salvar a vitrine. Tente novamente." };
  }

  // Revalida o link antigo (que deixa de existir) e o novo.
  if (previousSlug && previousSlug !== slug) revalidatePath(`/${previousSlug}`);
  revalidatePath(`/${slug}`);

  return { ok: true };
}

/** Data pt-BR (DD/MM/AAAA) a partir de `now` + N dias — usada nos prazos LGPD. */
function brDatePlusDays(days: number): string {
  const d = new Date(Date.now() + days * 86_400_000);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeZone: "America/Sao_Paulo",
  }).format(d);
}

export async function requestAccountDeletionAction(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sessão expirada. Entre novamente." };

  const { error } = await supabase.rpc("request_account_deletion");
  if (error) return { ok: false, error: "Não foi possível concluir o pedido. Tente novamente." };

  // E-mail de confirmação com os prazos (#0021). Best-effort: nunca bloqueia o fluxo.
  if (user.email) {
    try {
      await sendEmail({
        to: user.email,
        ...accountDeletionRequestedEmail({
          anonymizeDate: brDatePlusDays(30),
          deleteDate: brDatePlusDays(90),
        }),
      });
    } catch {
      // best-effort
    }
  }

  await supabase.auth.signOut();
  redirect("/login?erro=conta-excluida");
}
