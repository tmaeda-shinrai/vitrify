import { AsaasGateway } from "./asaas";
import type { PaymentGateway } from "./types";

export * from "./types";
export { PLAN_CATALOG, getPlanEntry, type PlanCatalogEntry } from "./plans";

let gateway: PaymentGateway | null = null;

/**
 * Ponto único de acesso ao gateway (#0018). Trocar Asaas → Pagar.me = devolver
 * outra implementação aqui; os call-sites (`/api/checkout`, webhook) não mudam.
 */
export function getPaymentGateway(): PaymentGateway {
  if (!gateway) gateway = new AsaasGateway();
  return gateway;
}
