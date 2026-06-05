import { clientEnv } from "@/lib/env";

/**
 * Templates pt-BR dos e-mails transacionais (#0019). Funções puras → fáceis de
 * testar. HTML inline simples (compatível com clientes de e-mail). Sem PII além do
 * necessário (nunca CPF/cartão).
 */
export interface EmailContent {
  subject: string;
  html: string;
}

const APP_URL = clientEnv.NEXT_PUBLIC_APP_URL;
const PLAN_URL = `${APP_URL}/conta/plano`;

function layout(heading: string, bodyHtml: string): string {
  return `<div style="font-family:system-ui,-apple-system,Arial,sans-serif;max-width:520px;margin:0 auto;color:#111827">
    <p style="font-size:20px;font-weight:700;color:#7C3AED;margin:0 0 16px">Vitrinio</p>
    <h1 style="font-size:18px;margin:0 0 12px">${heading}</h1>
    ${bodyHtml}
    <p style="font-size:12px;color:#6B7280;margin-top:24px">Vitrinio — sua vitrine digital.</p>
  </div>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:20px 0"><a href="${href}" style="background:#7C3AED;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;display:inline-block">${label}</a></p>`;
}

export function subscriptionConfirmedEmail(params: { planName: string }): EmailContent {
  return {
    subject: `Bem-vinda ao ${params.planName}! 🎉`,
    html: layout(
      `Seu plano ${params.planName} está ativo`,
      `<p>Pagamento confirmado! Agora você tem produtos ilimitados e os recursos avançados da sua vitrine.</p>
       ${button(PLAN_URL, "Ver meu plano")}`,
    ),
  };
}

export function invoiceReceiptEmail(params: {
  planName: string;
  amountLabel: string;
  invoiceUrl: string | null;
}): EmailContent {
  return {
    subject: `Recibo do seu pagamento — ${params.planName}`,
    html: layout(
      "Recebemos seu pagamento",
      `<p>Plano <strong>${params.planName}</strong> — <strong>${params.amountLabel}</strong>.</p>
       ${params.invoiceUrl ? button(params.invoiceUrl, "Ver fatura (PDF)") : ""}`,
    ),
  };
}

const REFERRALS_URL = `${APP_URL}/conta/indicacoes`;

export function referralInviteEmail(): EmailContent {
  return {
    subject: "Indique uma amiga e ganhe 1 mês grátis 🎁",
    html: layout(
      "Convide amigas e ganhe meses grátis",
      `<p>Conhece outras revendedoras? Indique pelo seu link: cada amiga entra com 30 dias de Pro grátis e, quando ela assina, <strong>você ganha 1 mês grátis</strong> na sua próxima fatura.</p>
       ${button(REFERRALS_URL, "Pegar meu link de indicação")}`,
    ),
  };
}

export function referralConvertedEmail(): EmailContent {
  return {
    subject: "Sua indicação assinou — você ganhou 1 mês grátis! 🎉",
    html: layout(
      "Você ganhou 1 mês grátis",
      `<p>Boa notícia! Uma pessoa que você indicou assinou o Vitrinio. Como agradecimento, <strong>sua próxima fatura foi adiada em 1 mês</strong> — esse mês é por nossa conta.</p>
       ${button(REFERRALS_URL, "Ver minhas indicações")}`,
    ),
  };
}

const DUNNING: Record<1 | 3 | 7, { subject: string; heading: string; body: string }> = {
  1: {
    subject: "Não conseguimos confirmar seu pagamento",
    heading: "Houve um problema com seu pagamento",
    body: "Não conseguimos confirmar a cobrança do seu plano. Atualize seus dados de pagamento para manter os recursos ativos.",
  },
  3: {
    subject: "Seu pagamento ainda está pendente",
    heading: "Seu pagamento continua pendente",
    body: "Ainda não recebemos o pagamento do seu plano. Regularize para não perder o acesso aos recursos pagos.",
  },
  7: {
    subject: "Seu plano está prestes a ser rebaixado",
    heading: "Última chance antes do rebaixamento",
    body: "Seu pagamento segue pendente. Em alguns dias sua vitrine volta ao limite do plano Free — seus produtos não são apagados, mas o excedente fica oculto até você regularizar.",
  },
};

export function dunningEmail(stage: 1 | 3 | 7): EmailContent {
  const d = DUNNING[stage];
  return {
    subject: d.subject,
    html: layout(d.heading, `<p>${d.body}</p>${button(PLAN_URL, "Atualizar pagamento")}`),
  };
}
