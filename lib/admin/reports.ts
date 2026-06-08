import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Leitura das denúncias para o admin (#0023) — service role (tabela sem policy).
 * Junta o slug da vitrine para exibição. Filtro opcional por status.
 */
export interface AdminReportRow {
  id: string;
  vitrineId: string;
  slug: string | null;
  reason: string;
  description: string | null;
  reporterEmail: string | null;
  status: string;
  createdAt: string | null;
  resolvedAt: string | null;
}

export async function listReports(status?: string, limit = 100): Promise<AdminReportRow[]> {
  const admin = createAdminClient();
  let query = admin
    .from("reports")
    .select(
      "id, vitrine_id, reason, description, reporter_email, status, created_at, resolved_at, vitrines(slug)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (status) query = query.eq("status", status);

  const { data } = await query;
  return (data ?? []).map((r) => ({
    id: r.id,
    vitrineId: r.vitrine_id,
    slug: r.vitrines?.slug ?? null,
    reason: r.reason,
    description: r.description,
    reporterEmail: r.reporter_email,
    status: r.status,
    createdAt: r.created_at,
    resolvedAt: r.resolved_at,
  }));
}
