import { NextResponse, type NextRequest } from "next/server";

import { onlyDigits } from "@/lib/cpf-cnpj";
import { getPaymentGateway, getPlanEntry, PaymentGatewayError } from "@/lib/payments";
import { checkCheckoutRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { checkoutSchema } from "@/lib/validators/checkout";

export const runtime = "nodejs";

/**
 * `POST /api/checkout` (#0018) — cria/garante o cliente Asaas, abre a assinatura
 * recorrente e devolve a `invoiceUrl` (página hospedada PIX/cartão/boleto) para o
 * redirect. O `status`/`plan` só viram `active`/pago via webhook (#0018 PR3); aqui
 * gravamos só as ids do Asaas e o período, via RPC (RLS de subscriptions é select-only).
 * O CPF/CNPJ é forward-only: vai ao Asaas e não é persistido nem logado.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticada." }, { status: 401 });

  const { success } = await checkCheckoutRateLimit(user.id);
  if (!success) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um instante." }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados de checkout inválidos." }, { status: 400 });
  }
  const { plan, period, cpfCnpj } = parsed.data;

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from("profiles").select("full_name, whatsapp").eq("id", user.id).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("id, plan, asaas_customer_id")
      .eq("owner_id", user.id)
      .maybeSingle(),
  ]);

  if (!subscription) {
    return NextResponse.json({ error: "Assinatura não encontrada." }, { status: 500 });
  }
  if (!user.email) {
    return NextResponse.json({ error: "Conta sem e-mail para faturamento." }, { status: 400 });
  }

  const gateway = getPaymentGateway();
  const entry = getPlanEntry(plan, period);

  try {
    let customerId = subscription.asaas_customer_id;
    if (!customerId) {
      const created = await gateway.createCustomer({
        name: profile?.full_name ?? "Cliente Vitrinio",
        email: user.email,
        cpfCnpj: onlyDigits(cpfCnpj),
        mobilePhone: profile?.whatsapp ?? undefined,
        externalReference: user.id,
      });
      customerId = created.customerId;
      await supabase.rpc("attach_asaas_checkout", { p_customer_id: customerId });
    }

    const result = await gateway.createSubscription({
      customerId,
      valueCents: entry.valueCents,
      cycle: entry.cycle,
      description: `Vitrinio ${entry.label}`,
      externalReference: user.id,
    });

    await supabase.rpc("attach_asaas_checkout", {
      p_subscription_id: result.subscriptionId,
      p_period_start: result.currentPeriodStart ?? undefined,
      p_period_end: result.currentPeriodEnd ?? undefined,
    });

    if (!result.invoiceUrl) {
      return NextResponse.json(
        { error: "Não foi possível obter o link de pagamento." },
        { status: 502 },
      );
    }

    return NextResponse.json({ invoiceUrl: result.invoiceUrl });
  } catch (error) {
    // Log sem PII: nunca o CPF, só metadados do erro.
    console.error("[checkout] falha ao criar assinatura", {
      userId: user.id,
      plan,
      period,
      status: error instanceof PaymentGatewayError ? error.status : undefined,
    });
    const message =
      error instanceof PaymentGatewayError
        ? error.message
        : "Não foi possível iniciar o pagamento. Tente novamente.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
