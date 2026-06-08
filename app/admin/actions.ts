"use server";

import { revalidatePath } from "next/cache";

import { getAdminUser } from "@/lib/admin/guard";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Registra a ação de moderação na auditoria (actor = admin). Best-effort. */
async function auditModeration(
  admin: ReturnType<typeof createAdminClient>,
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  reason: string | null,
): Promise<void> {
  await admin.from("audit_logs").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata: reason ? { reason } : null,
  });
}

export async function blockVitrineAction(vitrineId: string, reason: string): Promise<ActionResult> {
  const adminUser = await getAdminUser();
  if (!adminUser) return { ok: false, error: "Acesso negado." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("vitrines")
    .update({ blocked_at: new Date().toISOString(), blocked_reason: reason || null })
    .eq("id", vitrineId);
  if (error) return { ok: false, error: "Não foi possível bloquear a vitrine." };

  await auditModeration(admin, adminUser.id, "vitrine.blocked", "vitrine", vitrineId, reason);
  revalidatePath("/admin/contas", "page");
  return { ok: true };
}

export async function unblockVitrineAction(vitrineId: string): Promise<ActionResult> {
  const adminUser = await getAdminUser();
  if (!adminUser) return { ok: false, error: "Acesso negado." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("vitrines")
    .update({ blocked_at: null, blocked_reason: null })
    .eq("id", vitrineId);
  if (error) return { ok: false, error: "Não foi possível reativar a vitrine." };

  await auditModeration(admin, adminUser.id, "vitrine.unblocked", "vitrine", vitrineId, null);
  revalidatePath("/admin/contas", "page");
  return { ok: true };
}

export async function blockAccountAction(userId: string, reason: string): Promise<ActionResult> {
  const adminUser = await getAdminUser();
  if (!adminUser) return { ok: false, error: "Acesso negado." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ blocked_at: new Date().toISOString(), blocked_reason: reason || null })
    .eq("id", userId);
  if (error) return { ok: false, error: "Não foi possível suspender a conta." };

  await auditModeration(admin, adminUser.id, "account.blocked", "profile", userId, reason);
  revalidatePath("/admin/contas", "page");
  return { ok: true };
}

export async function unblockAccountAction(userId: string): Promise<ActionResult> {
  const adminUser = await getAdminUser();
  if (!adminUser) return { ok: false, error: "Acesso negado." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ blocked_at: null, blocked_reason: null })
    .eq("id", userId);
  if (error) return { ok: false, error: "Não foi possível reativar a conta." };

  await auditModeration(admin, adminUser.id, "account.unblocked", "profile", userId, null);
  revalidatePath("/admin/contas", "page");
  return { ok: true };
}
