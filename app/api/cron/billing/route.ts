import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { decideBillingAction, dunningStage } from "@/lib/billing/transitions";
import { sendEmail } from "@/lib/email/client";
import { getUserEmail } from "@/lib/email/recipient";
import { dunningEmail, referralInviteEmail } from "@/lib/email/templates";
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
  // Inclui trials de indicação (#0020): status 'trialing' precisa entrar no escopo p/ expirar.
  const { data: subs, error } = await admin
    .from("subscriptions")
    .select("id, plan, status, past_due_since, canceled_at, current_period_end, owner_id")
    .neq("plan", "free")
    .or("status.eq.past_due,status.eq.trialing,canceled_at.not.is.null")
    .limit(500);

  if (error) {
    console.error("[cron-billing] falha ao ler assinaturas", { code: error.code });
    return new NextResponse(null, { status: 500 });
  }

  const now = new Date();
  let downgraded = 0;
  let dunningSent = 0;

  for (const sub of subs ?? []) {
    // Régua de inadimplência D1/D3/D7 (e-mail), isolada — nunca quebra o cron.
    if (sub.status === "past_due" && sub.past_due_since) {
      const stage = dunningStage(sub.past_due_since, now);
      if (stage) {
        try {
          const email = await getUserEmail(admin, sub.owner_id);
          if (email) {
            await sendEmail({ to: email, ...dunningEmail(stage) });
            dunningSent += 1;
          }
        } catch {
          // best-effort
        }
      }
    }

    const action = decideBillingAction(sub, now);
    if (action === "none") continue;

    // Cancelada → 'canceled'; past_due/trial vencido → 'expired'. Nunca apaga produtos.
    const patch =
      action === "downgrade_canceled"
        ? { plan: "free" as const, status: "canceled" as const }
        : { plan: "free" as const, status: "expired" as const, past_due_since: null };

    const { error: updateError } = await admin.from("subscriptions").update(patch).eq("id", sub.id);
    if (!updateError) downgraded += 1;
  }

  // Nudge de indicação (#0020): ~30 dias após o cadastro, lembra quem está em Pro+ de
  // indicar amigas. Idempotente via profiles.referral_nudge_sent_at. Best-effort.
  let nudgeSent = 0;
  const dayMs = 86_400_000;
  const nudgeFrom = new Date(now.getTime() - 33 * dayMs).toISOString();
  const nudgeTo = new Date(now.getTime() - 30 * dayMs).toISOString();
  const { data: nudgeCandidates } = await admin
    .from("profiles")
    .select("id")
    .is("referral_nudge_sent_at", null)
    .gte("created_at", nudgeFrom)
    .lt("created_at", nudgeTo)
    .limit(200);

  if (nudgeCandidates && nudgeCandidates.length > 0) {
    const ids = nudgeCandidates.map((p) => p.id);
    const { data: paidSubs } = await admin
      .from("subscriptions")
      .select("owner_id")
      .in("owner_id", ids)
      .in("plan", ["pro", "plus"]);
    const paidIds = new Set((paidSubs ?? []).map((s) => s.owner_id));

    for (const id of ids) {
      if (!paidIds.has(id)) continue; // só Pro+ recebe o nudge
      try {
        const email = await getUserEmail(admin, id);
        if (email) {
          await sendEmail({ to: email, ...referralInviteEmail() });
          nudgeSent += 1;
        }
        // Carimba para não reenviar (mesmo sem e-mail). Falha antes daqui → retry no dia seguinte.
        await admin
          .from("profiles")
          .update({ referral_nudge_sent_at: now.toISOString() })
          .eq("id", id);
      } catch {
        // best-effort
      }
    }
  }

  return NextResponse.json({
    ok: true,
    scanned: subs?.length ?? 0,
    downgraded,
    dunningSent,
    nudgeSent,
  });
}
