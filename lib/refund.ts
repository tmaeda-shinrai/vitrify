/**
 * Garantia de 7 dias (#0019, `docs/PRICING.md` §6.2): a 1ª assinatura paga pode ser
 * reembolsada integralmente dentro da janela. Helper puro (sem PII).
 */

export const REFUND_WINDOW_DAYS = 7;

export function isWithinRefundWindow(
  paidAtIso: string | null | undefined,
  now: Date = new Date(),
  days: number = REFUND_WINDOW_DAYS,
): boolean {
  if (!paidAtIso) return false;
  const paid = new Date(paidAtIso).getTime();
  if (!Number.isFinite(paid)) return false;
  const ageDays = (now.getTime() - paid) / 86_400_000;
  return ageDays >= 0 && ageDays <= days;
}
