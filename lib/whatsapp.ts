/**
 * Mensagens e link do WhatsApp (#0013). Helpers puros (sem diretiva) para serem
 * usados pelos botões (client) e testados isoladamente. O conteúdo das mensagens
 * é pt-BR — é o texto enviado à vendedora, não chrome de interface.
 */
import { formatBRL } from "@/lib/money";

/** Primeiro nome (para a saudação). Vazio se não houver nome. */
export function firstName(fullName: string | null | undefined): string {
  return (fullName ?? "").trim().split(/\s+/)[0] ?? "";
}

function greeting(ownerName: string | null | undefined): string {
  const name = firstName(ownerName);
  return name ? `Olá ${name}` : "Olá";
}

/** Mensagem de interesse num produto (nome + preço/promo + link da vitrine). */
export function buildProductMessage(input: {
  ownerName: string | null;
  productName: string;
  priceCents: number;
  promoPriceCents: number | null;
  vitrineUrl: string;
}): string {
  const price =
    input.promoPriceCents != null && input.promoPriceCents < input.priceCents
      ? input.promoPriceCents
      : input.priceCents;
  return `${greeting(input.ownerName)}, tenho interesse no produto: ${input.productName} — ${formatBRL(price)}. Vitrine: ${input.vitrineUrl}`;
}

/** Mensagem genérica do botão flutuante (dúvida sem produto específico). */
export function buildGeneralMessage(ownerName: string | null): string {
  return `${greeting(ownerName)}, vi sua vitrine e queria tirar uma dúvida.`;
}

/** `wa.me/<dígitos>?text=<mensagem>`. `whatsapp` em E.164 (com ou sem máscara). */
export function buildWhatsappUrl(whatsapp: string, message: string): string {
  const digits = whatsapp.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
