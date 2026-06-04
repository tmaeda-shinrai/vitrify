import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { decideBillingAction } from "@/lib/billing/transitions";
import { serverEnv } from "@/lib/env";
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
 * `POST /api/cron/billing` (#0019 PR5) — disparada 1x/dia pelo pg_cron (via pg_net)
 * com o header `x-cron-secret`. Aplica as transições por tempo: 30 dias em past_due →
 * Free; cancelada com período vencido → Free. **Nunca apaga produtos** (a vitrine
 * esconde o excedente ao vivo, ver `lib/billing/limits`). Service role isolado.
 */
export async function POST(request: NextRequest) {
  const secret = serverEnv.CRON_SECRET;
  const token = request.headers.get("x-cron-secret") ?? "";
  if (!secret || !safeEqual(token, secret)) {
    return new NextResponse(null, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: subs, error } = await admin
    .from("subscriptions")
    .select("id, plan, status, past_due_since, canceled_at, current_period_end")
    .neq("plan", "free")
    .or("status.eq.past_due,canceled_at.not.is.null")
    .limit(500);

  if (error) {
    console.error("[cron-billing] falha ao ler assinaturas", { code: error.code });
    return new NextResponse(null, { status: 500 });
  }

  const now = new Date();
  let downgraded = 0;

  for (const sub of subs ?? []) {
    const action = decideBillingAction(sub, now);
    if (action === "none") continue;

    const patch =
      action === "downgrade_past_due"
        ? { plan: "free" as const, status: "expired" as const, past_due_since: null }
        : { plan: "free" as const, status: "canceled" as const };

    const { error: updateError } = await admin.from("subscriptions").update(patch).eq("id", sub.id);
    if (!updateError) downgraded += 1;
  }

  return NextResponse.json({ ok: true, scanned: subs?.length ?? 0, downgraded });
}
