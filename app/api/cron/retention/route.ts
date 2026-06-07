import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { serverEnv } from "@/lib/env";
import {
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
 *    analytics agregada, remove só o dado pessoal).
 * O ciclo de exclusão de conta (anonimização 30d / exclusão 90d) entra no PR3.
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

  return NextResponse.json({
    ok: true,
    auditDeleted: auditDeleted ?? 0,
    ipsCleared: ipsCleared ?? 0,
  });
}
