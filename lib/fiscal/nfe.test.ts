import { describe, expect, it } from "vitest";

import { NFE_MAX_ATTEMPTS, nfeFailurePatch, nfeSuccessPatch, serviceDescription } from "./nfe";
import { NoopFiscalGateway } from "./noop";

describe("serviceDescription", () => {
  it("nomeia o plano", () => {
    expect(serviceDescription("pro")).toBe("Assinatura Pro — Vitrinio");
    expect(serviceDescription("plus")).toBe("Assinatura Plus — Vitrinio");
  });

  it("cai num genérico sem plano", () => {
    expect(serviceDescription(null)).toBe("Assinatura Vitrinio");
  });
});

describe("nfeSuccessPatch", () => {
  it("marca issued com id/url/data", () => {
    const now = new Date("2026-06-09T12:00:00Z");
    expect(nfeSuccessPatch("nfe_1", "https://x/nota.pdf", now)).toEqual({
      nfe_status: "issued",
      nfe_id: "nfe_1",
      nfe_url: "https://x/nota.pdf",
      nfe_issued_at: now.toISOString(),
    });
  });
});

describe("nfeFailurePatch", () => {
  it("incrementa tentativas e não marca failed antes do teto", () => {
    const patch = nfeFailurePatch(0, "boom");
    expect(patch.nfe_attempts).toBe(1);
    expect(patch.nfe_status).toBeUndefined();
    expect(patch.nfe_error).toBe("boom");
  });

  it("marca failed ao atingir o teto", () => {
    const patch = nfeFailurePatch(NFE_MAX_ATTEMPTS - 1, "boom");
    expect(patch.nfe_attempts).toBe(NFE_MAX_ATTEMPTS);
    expect(patch.nfe_status).toBe("failed");
  });

  it("trunca a mensagem de erro em 500 chars", () => {
    expect(nfeFailurePatch(0, "x".repeat(600)).nfe_error).toHaveLength(500);
  });
});

describe("NoopFiscalGateway", () => {
  it("não está configurado e recusa emitir", async () => {
    const gw = new NoopFiscalGateway();
    expect(gw.isConfigured()).toBe(false);
    await expect(
      gw.issueInvoice({ paymentId: "p1", amountCents: 3900, description: "x" }),
    ).rejects.toThrow();
  });
});
