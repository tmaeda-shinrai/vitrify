import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { serverEnv } from "@/lib/env";
import { mapAsaasPayment } from "@/lib/payments";
import {
  eventIdFor,
  invoiceRowForPayment,
  subscriptionPatchForPayment,
} from "@/lib/payments/webhook";
import { createAdminClient } from "@/lib/supabase/admin";
import { asaasWebhookSchema } from "@/lib/validators/asaas-webhook";

export const runtime = "nodejs";

type AdminClient = ReturnType<typeof createAdminClient>;

/** Comparação em tempo constante (evita timing attack na checagem do token). */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

async function resolveSubscription(
  admin: AdminClient,
  subscriptionId: string | null | undefined,
  customerId: string | null | undefined,
) {
  if (subscriptionId) {
    const { data } = await admin
      .from("subscriptions")
      .select("id, plan")
      .eq("asaas_subscription_id", subscriptionId)
      .maybeSingle();
    if (data) return data;
  }
  if (customerId) {
    const { data } = await admin
      .from("subscriptions")
      .select("id, plan")
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
      return NextResponse.json({ ok: true, idempotent: true });
    }
    console.error("[asaas-webhook] falha ao registrar evento", { eventId, code: dedupError.code });
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
    if (Object.keys(patch).length > 0) {
      const { error: subError } = await admin
        .from("subscriptions")
        .update(patch)
        .eq("id", subscription.id);
      if (subError) throw new Error(`subscription update (${subError.code})`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Libera o evento para o Asaas reentregar (não perde o efeito numa falha).
    await admin.from("payment_webhook_events").delete().eq("event_id", eventId);
    console.error("[asaas-webhook] erro ao processar; evento liberado p/ retry", {
      eventId,
      message: error instanceof Error ? error.message : "desconhecido",
    });
    return new NextResponse(null, { status: 500 });
  }
}
