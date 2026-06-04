"use server";

import { revalidatePath } from "next/cache";

import { type ActionResult } from "@/app/(dashboard)/conta/actions";
import { getPaymentGateway, PaymentGatewayError } from "@/lib/payments";
import { isPaidPlan } from "@/lib/plan";
import { isWithinRefundWindow } from "@/lib/refund";
import { createClient } from "@/lib/supabase/server";
import { cancelSchema, type CancelInput } from "@/lib/validators/cancel";

/**
 * Cancelamento self-service (#0019). Cancela a assinatura no Asaas (para a cobrança
 * recorrente) e marca `canceled_at` via RPC — o acesso segue até o fim do período já
 * pago (o downgrade ao fim do período é do cron de billing, PR5). Guarda a pesquisa
 * de saída opcional na auditoria.
 */
export async function cancelSubscriptionAction(input: CancelInput): Promise<ActionResult> {
  const parsed = cancelSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dados inválidos." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sessão expirada. Entre novamente." };

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("asaas_subscription_id, plan, canceled_at")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!sub || !isPaidPlan(sub.plan)) {
    return { ok: false, error: "Você não tem uma assinatura ativa." };
  }
  if (sub.canceled_at) return { ok: true };

  if (sub.asaas_subscription_id) {
    try {
      await getPaymentGateway().cancelSubscription(sub.asaas_subscription_id);
    } catch {
      return {
        ok: false,
        error: "Não foi possível cancelar no provedor de pagamento. Tente novamente.",
      };
    }
  }

  const { error } = await supabase.rpc("request_subscription_cancel", {
    p_reason: parsed.data.reason ?? undefined,
    p_comment: parsed.data.comment ?? undefined,
  });
  if (error) return { ok: false, error: "Não foi possível cancelar. Tente novamente." };

  revalidatePath("/conta/plano");
  return { ok: true };
}

/**
 * Reembolso da garantia de 7 dias (#0019). Estorna a 1ª fatura paga no Asaas (se
 * dentro da janela), cancela a assinatura e rebaixa para Free na hora. Os produtos
 * são preservados. O webhook `PAYMENT_REFUNDED` concilia o estado depois.
 */
export async function refundFirstPaymentAction(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sessão expirada. Entre novamente." };

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("id, asaas_subscription_id, plan")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!sub || !isPaidPlan(sub.plan)) {
    return { ok: false, error: "Você não tem uma assinatura ativa." };
  }

  const { data: invoice } = await supabase
    .from("invoices")
    .select("asaas_payment_id, paid_at")
    .eq("subscription_id", sub.id)
    .eq("status", "paid")
    .order("paid_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!invoice || !isWithinRefundWindow(invoice.paid_at)) {
    return { ok: false, error: "O prazo de reembolso de 7 dias já passou." };
  }

  const gateway = getPaymentGateway();
  try {
    await gateway.refundPayment(invoice.asaas_payment_id);
    if (sub.asaas_subscription_id) await gateway.cancelSubscription(sub.asaas_subscription_id);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof PaymentGatewayError
          ? error.message
          : "Não foi possível processar o reembolso. Tente novamente.",
    };
  }

  const { error } = await supabase.rpc("downgrade_to_free");
  if (error) {
    return {
      ok: false,
      error: "Reembolso feito, mas houve um erro ao atualizar o plano. Fale com o suporte.",
    };
  }

  revalidatePath("/conta/plano");
  return { ok: true };
}
