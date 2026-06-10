import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { notifyAdmins } from "@/lib/alerts";
import { adminAlertEmail } from "@/lib/email/templates";
import { serverEnv } from "@/lib/env";
import {
  getFiscalGateway,
  NFE_MAX_ATTEMPTS,
  nfeFailurePatch,
  nfeSuccessPatch,
  serviceDescription,
} from "@/lib/fiscal";
import { planFromValueCents } from "@/lib/payments";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** Quantas notas emitir por execução (a cron roda de hora em hora). */
const BATCH = 50;

/** Comparação em tempo constante do segredo do cron. */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * `POST /api/cron/nfe` (#0025) — disparada periodicamente pelo pg_cron (via pg_net) com
 * o header `x-cron-secret`. Emite a NFS-e das faturas **pagas ainda sem nota** pelo
 * módulo de NF-e do Asaas (`docs/PRICING.md` §7), com teto de tentativas (`NFE_MAX_ATTEMPTS`)
 * e alerta aos admins nas que falham em definitivo. No-op se nenhum provedor fiscal
 * estiver configurado (`FISCAL_PROVIDER`). Service role isolado.
 */
export async function POST(request: NextRequest) {
  const secret = serverEnv.CRON_SECRET;
  const token = request.headers.get("x-cron-secret") ?? "";
  if (!secret || !safeEqual(token, secret)) {
    return new NextResponse(null, { status: 401 });
  }

  const gateway = getFiscalGateway();
  if (!gateway.isConfigured()) {
    return NextResponse.json({ ok: true, skipped: "fiscal_provider_not_configured" });
  }

  const admin = createAdminClient();
  const { data: pending, error } = await admin
    .from("invoices")
    .select("id, asaas_payment_id, amount_cents, nfe_attempts")
    .eq("status", "paid")
    .is("nfe_status", null)
    .lt("nfe_attempts", NFE_MAX_ATTEMPTS)
    .order("paid_at", { ascending: true })
    .limit(BATCH);

  if (error) {
    console.error("[cron-nfe] falha ao listar faturas pendentes", { code: error.code });
    return new NextResponse(null, { status: 500 });
  }

  let issued = 0;
  let failedFinal = 0;

  for (const inv of pending ?? []) {
    const plan = planFromValueCents(inv.amount_cents)?.plan ?? null;
    try {
      const result = await gateway.issueInvoice({
        paymentId: inv.asaas_payment_id,
        amountCents: inv.amount_cents,
        description: serviceDescription(plan),
      });
      await admin
        .from("invoices")
        .update(nfeSuccessPatch(result.nfeId, result.url))
        .eq("id", inv.id);
      issued += 1;
    } catch (e) {
      const message = e instanceof Error ? e.message : "erro desconhecido";
      const patch = nfeFailurePatch(inv.nfe_attempts, message);
      await admin.from("invoices").update(patch).eq("id", inv.id);
      if (patch.nfe_status === "failed") failedFinal += 1;
    }
  }

  if (failedFinal > 0) {
    await notifyAdmins(
      adminAlertEmail({
        title: "Falha na emissão de NF-e",
        message: `${failedFinal} fatura(s) atingiram o limite de tentativas de emissão de NFS-e. Verifique o provedor fiscal e emita manualmente se necessário.`,
      }),
    ).catch(() => {});
  }

  return NextResponse.json({ ok: true, processed: pending?.length ?? 0, issued, failedFinal });
}
