import { serverEnv } from "@/lib/env";

/**
 * Envio de e-mail transacional via Resend (#0019), por REST (sem SDK). No-op quando
 * `RESEND_API_KEY`/`EMAIL_FROM` não estão configurados (padrão dos no-ops do projeto:
 * dev/CI seguem sem enviar). Nunca lança — e-mail nunca pode quebrar webhook/cron.
 */
export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(msg: EmailMessage): Promise<void> {
  const apiKey = serverEnv.RESEND_API_KEY;
  if (!apiKey || !serverEnv.EMAIL_FROM) return;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: serverEnv.EMAIL_FROM,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        ...(serverEnv.EMAIL_REPLY_TO ? { reply_to: serverEnv.EMAIL_REPLY_TO } : {}),
      }),
    });
    if (!res.ok) console.error("[email] envio falhou", { status: res.status });
  } catch {
    console.error("[email] erro de rede ao enviar");
  }
}
