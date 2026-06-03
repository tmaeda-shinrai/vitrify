"use client";

import { Button } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/vitrine/whatsapp-icon";
import { recordOrderIntent, type OrderIntentPayload } from "@/lib/intent";
import { cn } from "@/lib/utils";
import { buildWhatsappUrl } from "@/lib/whatsapp";

interface Props {
  /** WhatsApp da dona em E.164 (com ou sem máscara); `null` desabilita. */
  whatsapp: string | null;
  message: string;
  label: string;
  /** Disparo não-bloqueante da intenção no clique (#0015 persiste). */
  intent?: OrderIntentPayload;
  /** Esgotado: vira botão desabilitado com `disabledLabel`. */
  disabled?: boolean;
  disabledLabel?: string;
  ariaLabel?: string;
  className?: string;
}

/**
 * Botão "Pedir no WhatsApp" (#0013): abre `wa.me` com a mensagem pronta e dispara
 * a intenção no mesmo clique, sem bloquear. Desabilitado quando esgotado/sem número.
 */
export function WhatsAppButton({
  whatsapp,
  message,
  label,
  intent,
  disabled,
  disabledLabel,
  ariaLabel,
  className,
}: Props) {
  const greenClass = cn("w-full bg-whatsapp text-white hover:bg-whatsapp/90", className);

  if (disabled || !whatsapp) {
    return (
      <Button type="button" disabled aria-label={ariaLabel} className={greenClass}>
        <WhatsappIcon />
        {disabledLabel ?? label}
      </Button>
    );
  }

  return (
    <Button asChild className={greenClass}>
      <a
        href={buildWhatsappUrl(whatsapp, message)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel ?? label}
        onClick={() => {
          if (intent) recordOrderIntent(intent);
        }}
      >
        <WhatsappIcon />
        {label}
      </a>
    </Button>
  );
}
