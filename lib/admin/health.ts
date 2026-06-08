import { serverEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Health check dos serviços (#0023, ARCHITECTURE §8.4). Banco e Storage têm ping
 * real; pagamento e e-mail são reportados por configuração (ping externo fica
 * best-effort/futuro para não deixar a página flaky). `summarizeHealth` é puro.
 */
export type HealthStatus = "ok" | "down" | "unconfigured";

export interface ServiceHealth {
  name: string;
  status: HealthStatus;
  detail: string;
}

/** Pior status do conjunto (down > unconfigured > ok) — para o badge geral. */
export function summarizeHealth(services: ServiceHealth[]): HealthStatus {
  if (services.some((s) => s.status === "down")) return "down";
  if (services.some((s) => s.status === "unconfigured")) return "unconfigured";
  return "ok";
}

export async function checkHealth(): Promise<ServiceHealth[]> {
  const admin = createAdminClient();

  const db: ServiceHealth = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .then(
      ({ error }) =>
        error
          ? { name: "Banco de dados", status: "down" as const, detail: error.message }
          : { name: "Banco de dados", status: "ok" as const, detail: "conectado" },
      () => ({ name: "Banco de dados", status: "down" as const, detail: "sem resposta" }),
    );

  const storage: ServiceHealth = await admin.storage.listBuckets().then(
    ({ error }) =>
      error
        ? { name: "Storage", status: "down" as const, detail: error.message }
        : { name: "Storage", status: "ok" as const, detail: "acessível" },
    () => ({ name: "Storage", status: "down" as const, detail: "sem resposta" }),
  );

  const payment: ServiceHealth = serverEnv.ASAAS_API_KEY
    ? { name: "Pagamento (Asaas)", status: "ok", detail: "configurado" }
    : { name: "Pagamento (Asaas)", status: "unconfigured", detail: "sem ASAAS_API_KEY" };

  const email: ServiceHealth = serverEnv.RESEND_API_KEY
    ? { name: "E-mail (Resend)", status: "ok", detail: "configurado" }
    : { name: "E-mail (Resend)", status: "unconfigured", detail: "sem RESEND_API_KEY" };

  return [db, storage, payment, email];
}
