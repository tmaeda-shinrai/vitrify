import { Mail, MessageCircle } from "lucide-react";

import { clientEnv } from "@/lib/env";
import { buildWhatsappUrl } from "@/lib/whatsapp";

/**
 * Contato de suporte (#0022): botão de WhatsApp (atendimento humano nos primeiros
 * meses) com fallback de e-mail. O número vem de `NEXT_PUBLIC_SUPPORT_WHATSAPP`;
 * sem ele, só o e-mail aparece.
 */
export function SupportCta({
  message = "Olá, preciso de ajuda com o Vitrinio.",
}: {
  message?: string;
}) {
  const whatsapp = clientEnv.NEXT_PUBLIC_SUPPORT_WHATSAPP;
  const email = clientEnv.NEXT_PUBLIC_SUPPORT_EMAIL;

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      {whatsapp ? (
        <a
          href={buildWhatsappUrl(whatsapp, message)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <MessageCircle className="size-4" aria-hidden />
          Falar no WhatsApp
        </a>
      ) : null}
      <a
        href={`mailto:${email}`}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Mail className="size-4" aria-hidden />
        {email}
      </a>
    </div>
  );
}
