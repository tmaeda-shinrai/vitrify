"use client";

import { WhatsappIcon } from "@/components/vitrine/whatsapp-icon";
import { recordOrderIntent } from "@/lib/intent";
import { buildGeneralMessage, buildWhatsappUrl } from "@/lib/whatsapp";

interface Props {
  whatsapp: string | null;
  ownerName: string | null;
  slug: string;
  /** aria-label do botão flutuante. */
  label: string;
}

/**
 * Botão WhatsApp flutuante geral (#0013): dúvidas sem produto específico. Some
 * quando não há número. Dispara a intenção (source "floating") sem bloquear.
 */
export function VitrineWhatsappFab({ whatsapp, ownerName, slug, label }: Props) {
  if (!whatsapp) return null;

  return (
    <a
      href={buildWhatsappUrl(whatsapp, buildGeneralMessage(ownerName))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onClick={() => recordOrderIntent({ slug })}
      className="fixed bottom-4 right-4 z-40 grid size-14 place-items-center rounded-full bg-whatsapp text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:size-7"
    >
      <WhatsappIcon />
    </a>
  );
}
