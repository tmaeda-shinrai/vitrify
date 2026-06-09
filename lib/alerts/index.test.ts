// @vitest-environment node
// lib/alerts lê serverEnv no topo (módulo server-only); precisa rodar sem `window`.
import { describe, expect, it } from "vitest";

import {
  alertRecipients,
  clearAsaasWebhookFailures,
  recordAsaasWebhookFailure,
  WEBHOOK_FAILURE_THRESHOLD,
} from "@/lib/alerts";
import { adminAlertEmail } from "@/lib/email/templates";

describe("alerts", () => {
  it("o limiar de falhas do webhook é 3", () => {
    expect(WEBHOOK_FAILURE_THRESHOLD).toBe(3);
  });

  it("alertRecipients devolve uma lista (vazia sem ADMIN_EMAILS)", () => {
    expect(Array.isArray(alertRecipients())).toBe(true);
  });

  it("sem Upstash (test) o contador de falhas é no-op", async () => {
    expect(await recordAsaasWebhookFailure()).toBe(false);
    await expect(clearAsaasWebhookFailures()).resolves.toBeUndefined();
  });
});

describe("adminAlertEmail", () => {
  it("monta assunto e corpo, incluindo os detalhes (rótulo/valor)", () => {
    const { subject, html } = adminAlertEmail({
      title: "Webhook do Asaas falhando",
      message: "O webhook falhou 3 vezes seguidas.",
      details: { Motivo: "timeout" },
    });
    expect(subject).toContain("Webhook do Asaas falhando");
    expect(html).toContain("O webhook falhou 3 vezes seguidas.");
    expect(html).toContain("Motivo");
    expect(html).toContain("timeout");
  });

  it("funciona sem detalhes", () => {
    const { html } = adminAlertEmail({ title: "Serviço indisponível", message: "Algo caiu." });
    expect(html).toContain("Algo caiu.");
  });
});
