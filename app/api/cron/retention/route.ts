import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { sendEmail } from "@/lib/email/client";
import { getUserEmail } from "@/lib/email/recipient";
import { accountAnonymizedEmail, accountDeletedEmail } from "@/lib/email/templates";
import { serverEnv } from "@/lib/env";
import {
  ACCOUNT_ANONYMIZE_DAYS,
  ACCOUNT_DELETE_DAYS,
  AUDIT_LOG_RETENTION_DAYS,
  ORDER_INTENT_IP_RETENTION_MONTHS,
  cutoffDaysAgo,
  cutoffMonthsAgo,
} from "@/lib/retention/windows";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** Comparação em tempo constante do segredo do cron. */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * `POST /api/cron/retention` (#0021 PR2) — disparada 1x/dia pelo pg_cron (via pg_net)
 * com o header `x-cron-secret`. Aplica a política de retenção (`docs/LEGAL.md` §1.5):
 *  - apaga logs de auditoria com mais de 180 dias;
 *  - anula o ip_hash de intenções de pedido com mais de 12 meses (mantém a linha p/
 *    analytics agregada, remove só o dado pessoal);
 *  - anonimiza contas 30 dias após o pedido de exclusão e as exclui aos 90 dias,
 *    notificando a usuária por e-mail (best-effort, idempotente).
 * Service role isolado.
 */
export async function POST(request: NextRequest) {
  const secret = serverEnv.CRON_SECRET;
  const token = request.headers.get("x-cron-secret") ?? "";
  if (!secret || !safeEqual(token, secret)) {
    return new NextResponse(null, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();

  const { count: auditDeleted, error: auditError } = await admin
    .from("audit_logs")
    .delete({ count: "exact" })
    .lt("created_at", cutoffDaysAgo(now, AUDIT_LOG_RETENTION_DAYS));

  if (auditError) {
    console.error("[cron-retention] falha ao limpar audit_logs", { code: auditError.code });
    return new NextResponse(null, { status: 500 });
  }

  const { count: ipsCleared, error: intentError } = await admin
    .from("order_intents")
    .update({ ip_hash: null }, { count: "exact" })
    .lt("created_at", cutoffMonthsAgo(now, ORDER_INTENT_IP_RETENTION_MONTHS))
    .not("ip_hash", "is", null);

  if (intentError) {
    console.error("[cron-retention] falha ao limpar ip_hash de order_intents", {
      code: intentError.code,
    });
    return new NextResponse(null, { status: 500 });
  }

  // --- Ciclo de exclusão de conta (LGPD §1.5) ---
  // Anonimização aos 30 dias: contas pedidas há ≥30d ainda não anonimizadas.
  let anonymized = 0;
  const { data: toAnonymize } = await admin
    .from("profiles")
    .select("id")
    .not("deletion_requested_at", "is", null)
    .lte("deletion_requested_at", cutoffDaysAgo(now, ACCOUNT_ANONYMIZE_DAYS))
    .is("anonymized_at", null)
    .limit(200);

  for (const p of toAnonymize ?? []) {
    try {
      const { error: anonError } = await admin.rpc("anonymize_account", { p_user: p.id });
      if (anonError) continue;
      anonymized += 1;
      const email = await getUserEmail(admin, p.id);
      if (email) await sendEmail({ to: email, ...accountAnonymizedEmail() });
    } catch {
      // best-effort
    }
  }

  // Exclusão definitiva aos 90 dias. Pega o e-mail ANTES do delete (some com a usuária).
  let deleted = 0;
  const { data: toDelete } = await admin
    .from("profiles")
    .select("id")
    .not("deletion_requested_at", "is", null)
    .lte("deletion_requested_at", cutoffDaysAgo(now, ACCOUNT_DELETE_DAYS))
    .limit(200);

  for (const p of toDelete ?? []) {
    try {
      const email = await getUserEmail(admin, p.id);
      const { error: delError } = await admin.rpc("hard_delete_account", { p_user: p.id });
      if (delError) continue;
      deleted += 1;
      if (email) await sendEmail({ to: email, ...accountDeletedEmail() });
    } catch {
      // best-effort
    }
  }

  return NextResponse.json({
    ok: true,
    auditDeleted: auditDeleted ?? 0,
    ipsCleared: ipsCleared ?? 0,
    anonymized,
    deleted,
  });
}
