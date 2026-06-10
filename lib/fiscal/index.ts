import { serverEnv } from "@/lib/env";

import { AsaasFiscalGateway } from "./asaas";
import { NoopFiscalGateway } from "./noop";
import type { FiscalGateway } from "./types";

export * from "./types";
export * from "./nfe";

let gateway: FiscalGateway | null = null;

/**
 * Ponto único de acesso ao gateway fiscal (#0025). `FISCAL_PROVIDER=asaas` liga o
 * módulo de NF-e do Asaas; ausente/`none` → no-op (a cron não emite nada). Trocar de
 * provedor = devolver outra implementação aqui; o cron (`/api/cron/nfe`) não muda.
 */
export function getFiscalGateway(): FiscalGateway {
  if (gateway) return gateway;
  gateway =
    serverEnv.FISCAL_PROVIDER === "asaas" ? new AsaasFiscalGateway() : new NoopFiscalGateway();
  return gateway;
}
