import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import {
  clearAsaasWebhookFailures,
  notifyAdmins,
  recordAsaasWebhookFailure,
  WEBHOOK_FAILURE_THRESHOLD,
} from "@/lib/alerts";
import { sendEmail } from "@/lib/email/client";
import { getUserEmail } from "@/lib/email/recipient";
import {
  adminAlertEmail,
  invoiceReceiptEmail,
  referralConvertedEmail,
  subscriptionConfirmedEmail,
} from "@/lib/email/templates";
import { serverEnv } from "@/lib/env";
import { formatBRL } from "@/lib/money";
import { getPaymentGateway, mapAsaasPayment, planFromValueCents } from "@/lib/payments";
import {
  eventIdFor,
  invoiceRowForPayment,
  subscriptionPatchForPayment,
} from "@/lib/payments/webhook";
import { isPaidPlan } from "@/lib/plan";
import { decideReferralReward } from "@/lib/referrals";
import { createAdminClient } from "@/lib/supabase/admin";
import { asaasWebhookSchema } from "@/lib/validators/asaas-webhook";

export const runtime = "nodejs";

const PLAN_NAMES: Record<string, string> = { pro: "Pro", plus: "Plus" };

type AdminClient = ReturnType<typeof createAdminClient>;

/** Comparação em tempo constante (evita timing attack na checagem do token). */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** Alerta best-effort (#0024): e-mail aos admins na Nª falha (5xx) seguida do webhook. */
async function reportWebhookFailure(reason: string): Promise<void> {
  try {
    if (await recordAsaasWebhookFailure()) {
      await notifyAdmins(
        adminAlertEmail({
          title: "Webhook do Asaas falhando",
          message: `O webhook /api/webhooks/asaas falhou ${WEBHOOK_FAILURE_THRESHOLD} vezes seguidas. Verifique o gateway de pagamento e os logs.`,
          details: { Motivo: reason },
        }),
      );
    }
  } catch {
    // Alerta nunca quebra o webhook.
  }
}

async function resolveSubscription(
  admin: AdminClient,
  subscriptionId: string | null | undefined,
  customerId: string | null | undefined,
) {
  if (subscriptionId) {
    const { data } = await admin
      .from("subscriptions")
      .select("id, plan, past_due_since, owner_id")
      .eq("asaas_subscription_id", subscriptionId)
      .maybeSingle();
    if (data) return data;
  }
  if (customerId) {
    const { data } = await admin
      .from("subscriptions")
      .select("id, plan, past_due_since, owner_id")
      .eq("asaas_customer_id", customerId)
      .maybeSingle();
    if (data) return data;
  }
  return null;
}

/**
 * `POST /api/webhooks/asaas` (#0018 PR3). Confirma o pagamento e reflete plano/fatura.
 * 1) autentica pelo token compartilhado (`asaas-access-token`) em tempo constante;
 * 2) idempotência: grava o id do evento (UNIQUE) antes de aplicar o efeito;
 * 3) faz upsert da fatura e atualiza `subscriptions.status/plan/período`.
 * Único handler com **service role** (RLS não cobre escrita aqui). Logs sem PII.
 */
export async function POST(request: NextRequest) {
  const secret = serverEnv.ASAAS_WEBHOOK_SECRET;
  const token = request.headers.get("asaas-access-token") ?? "";
  if (!secret || !safeEqual(token, secret)) {
    return new NextResponse(null, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const parsed = asaasWebhookSchema.safeParse(payload);
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  const data = parsed.data;

  const admin = createAdminClient();
  const eventId = eventIdFor(data);

  const { error: dedupError } = await admin.from("payment_webhook_events").insert({
    event_id: eventId,
    event_type: data.event,
    payment_id: data.payment?.id ?? null,
  });
  if (dedupError) {
    // 23505 = unique_violation → reentrega do mesmo evento, já processada.
    if (dedupError.code === "23505") {
      await clearAsaasWebhookFailures().catch(() => {});
      return NextResponse.json({ ok: true, idempotent: true });
    }
    console.error("[asaas-webhook] falha ao registrar evento", { eventId, code: dedupError.code });
    await reportWebhookFailure(`registro do evento (${dedupError.code})`);
    return new NextResponse(null, { status: 500 });
  }

  try {
    // Eventos sem `payment` (ex.: de assinatura) não têm efeito por ora.
    if (!data.payment) return NextResponse.json({ ok: true });

    const record = mapAsaasPayment({
      id: data.payment.id,
      subscription: data.payment.subscription ?? null,
      value: data.payment.value,
      status: data.payment.status,
      billingType: data.payment.billingType ?? "",
      invoiceUrl: data.payment.invoiceUrl ?? null,
      dueDate: data.payment.dueDate ?? null,
      paymentDate: data.payment.paymentDate ?? null,
      confirmedDate: data.payment.confirmedDate ?? null,
    });

    const subscription = await resolveSubscription(
      admin,
      data.payment.subscription,
      data.payment.customer,
    );
    if (!subscription) {
      console.warn("[asaas-webhook] assinatura não encontrada", { eventId, event: data.event });
      return NextResponse.json({ ok: true, unmatched: true });
    }

    const { error: invoiceError } = await admin
      .from("invoices")
      .upsert(invoiceRowForPayment(record, subscription.id), { onConflict: "asaas_payment_id" });
    if (invoiceError) throw new Error(`invoice upsert (${invoiceError.code})`);

    const patch = subscriptionPatchForPayment(record);
    // Marca o início da inadimplência só na 1ª vez (não reinicia o relógio a cada reentrega).
    if (patch.status === "past_due" && !subscription.past_due_since) {
      patch.past_due_since = new Date().toISOString();
    }
    if (Object.keys(patch).length > 0) {
      const { error: subError } = await admin
        .from("subscriptions")
        .update(patch)
        .eq("id", subscription.id);
      if (subError) throw new Error(`subscription update (${subError.code})`);
    }

    // E-mails transacionais (isolados: nunca quebram o webhook). Recibo a cada
    // pagamento; confirmação de boas-vindas só na 1ª ativação (plano ainda era free).
    if (record.status === "paid") {
      try {
        const email = await getUserEmail(admin, subscription.owner_id);
        if (email) {
          const mapped = planFromValueCents(record.amountCents);
          const planName = (mapped && PLAN_NAMES[mapped.plan]) || "Vitrinio";
          await sendEmail({
            to: email,
            ...invoiceReceiptEmail({
              planName,
              amountLabel: formatBRL(record.amountCents),
              invoiceUrl: record.invoiceUrl,
            }),
          });
          if (subscription.plan === "free") {
            await sendEmail({ to: email, ...subscriptionConfirmedEmail({ planName }) });
          }
        }
      } catch {
        // E-mail é best-effort.
      }

      // Conversão de indicação (#0020): a indicada virou pagante Pro+? Marca a
      // conversão e concede 1 mês grátis ao referrer (Pro+) adiando a próxima fatura.
      // Isolado/best-effort — nunca quebra o webhook de pagamento.
      try {
        const referredPlan = planFromValueCents(record.amountCents)?.plan ?? null;
        if (isPaidPlan(referredPlan)) {
          const { data: referral } = await admin
            .from("referrals")
            .select("id, referrer_id")
            .eq("referred_id", subscription.owner_id)
            .is("converted_at", null)
            .maybeSingle();

          if (referral) {
            const { data: referrer } = await admin
              .from("subscriptions")
              .select("plan, asaas_subscription_id")
              .eq("owner_id", referral.referrer_id)
              .maybeSingle();

            let rewardGranted = false;
            if (referrer?.asaas_subscription_id && isPaidPlan(referrer.plan)) {
              const gateway = getPaymentGateway();
              const nextPayment = await gateway.getNextPendingPayment(
                referrer.asaas_subscription_id,
              );
              const decision = decideReferralReward({
                referrerPlan: referrer.plan,
                referredPaidPlan: referredPlan,
                nextPaymentDueDate: nextPayment?.dueDate ?? null,
              });
              if (decision.shouldGrant && nextPayment && decision.newDueDate) {
                await gateway.updatePayment(nextPayment.paymentId, {
                  dueDate: decision.newDueDate,
                });
                rewardGranted = true;
              } else {
                console.warn("[asaas-webhook] indicação convertida sem fatura p/ adiar", {
                  referralId: referral.id,
                });
              }
            }

            // Idempotente: o filtro converted_at IS NULL barra reprocessamento.
            await admin
              .from("referrals")
              .update({ converted_at: new Date().toISOString(), reward_granted: rewardGranted })
              .eq("id", referral.id)
              .is("converted_at", null);

            if (rewardGranted) {
              const refEmail = await getUserEmail(admin, referral.referrer_id);
              if (refEmail) await sendEmail({ to: refEmail, ...referralConvertedEmail() });
            }
          }
        }
      } catch {
        // Indicação é best-effort: nunca quebra o webhook.
      }
    }

    await clearAsaasWebhookFailures().catch(() => {});
    return NextResponse.json({ ok: true });
  } catch (error) {
    // Libera o evento para o Asaas reentregar (não perde o efeito numa falha).
    await admin.from("payment_webhook_events").delete().eq("event_id", eventId);
    const message = error instanceof Error ? error.message : "desconhecido";
    console.error("[asaas-webhook] erro ao processar; evento liberado p/ retry", {
      eventId,
      message,
    });
    await reportWebhookFailure(message);
    return new NextResponse(null, { status: 500 });
  }
}
