import type { PlanSlug } from "@/lib/payments";

/**
 * Helpers puros da emissão de NFS-e (#0025) — fora do route handler para serem
 * testáveis sem mockar banco/HTTP. Traduzem o resultado da emissão num patch da fatura.
 */

/** Máximo de tentativas antes de marcar a nota como `failed` (e alertar os admins). */
export const NFE_MAX_ATTEMPTS = 5;

/** Descrição do serviço na NFS-e a partir do plano (reverse-lookup do valor no cron). */
export function serviceDescription(plan: PlanSlug | null): string {
  const name = plan === "pro" ? "Pro" : plan === "plus" ? "Plus" : null;
  return name ? `Assinatura ${name} — Vitrinio` : "Assinatura Vitrinio";
}

export interface NfePatch {
  nfe_status?: "issued" | "failed";
  nfe_id?: string;
  nfe_url?: string | null;
  nfe_issued_at?: string;
  nfe_attempts?: number;
  nfe_error?: string;
}

/** Patch da fatura após emissão bem-sucedida. */
export function nfeSuccessPatch(
  nfeId: string,
  url: string | null,
  now: Date = new Date(),
): NfePatch {
  return { nfe_status: "issued", nfe_id: nfeId, nfe_url: url, nfe_issued_at: now.toISOString() };
}

/** Patch após falha: incrementa tentativas; ao atingir o teto, marca `failed` (para de tentar). */
export function nfeFailurePatch(currentAttempts: number, error: string): NfePatch {
  const attempts = currentAttempts + 1;
  const patch: NfePatch = { nfe_attempts: attempts, nfe_error: error.slice(0, 500) };
  if (attempts >= NFE_MAX_ATTEMPTS) patch.nfe_status = "failed";
  return patch;
}
