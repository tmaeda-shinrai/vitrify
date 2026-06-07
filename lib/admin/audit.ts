import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Leitura dos `audit_logs` para o admin (#0023) — service role (a tabela não tem
 * policy de usuária). Filtros opcionais por ator, ação e intervalo de datas.
 */
export interface AuditLogRow {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  ipHash: string | null;
  createdAt: string | null;
}

export interface AuditFilters {
  actorId?: string;
  action?: string;
  from?: string;
  to?: string;
  limit?: number;
}

export async function listAuditLogs(filters: AuditFilters = {}): Promise<AuditLogRow[]> {
  const admin = createAdminClient();
  let query = admin
    .from("audit_logs")
    .select("id, actor_id, action, entity_type, entity_id, ip_hash, created_at")
    .order("created_at", { ascending: false })
    .limit(Math.min(filters.limit ?? 100, 500));

  if (filters.actorId) query = query.eq("actor_id", filters.actorId);
  if (filters.action) query = query.ilike("action", `${filters.action}%`);
  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) query = query.lte("created_at", filters.to);

  const { data } = await query;
  return (data ?? []).map((r) => ({
    id: r.id,
    actorId: r.actor_id,
    action: r.action,
    entityType: r.entity_type,
    entityId: r.entity_id,
    ipHash: r.ip_hash,
    createdAt: r.created_at,
  }));
}
