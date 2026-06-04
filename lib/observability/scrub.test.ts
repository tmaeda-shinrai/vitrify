import { describe, expect, it } from "vitest";

import { scrubEvent, scrubString } from "@/lib/observability/scrub";

describe("scrubString", () => {
  it("redige e-mails", () => {
    expect(scrubString("contato maria@exemplo.com.br aqui")).toBe("contato [redacted] aqui");
  });

  it("redige telefones e CPF", () => {
    expect(scrubString("ligue +55 (11) 98888-7777")).toContain("[redacted]");
    expect(scrubString("CPF 123.456.789-00")).toContain("[redacted]");
  });

  it("não toca em texto sem PII", () => {
    expect(scrubString("produto fora de estoque")).toBe("produto fora de estoque");
  });
});

describe("scrubEvent", () => {
  it("remove e-mail, username e ip do usuário (mantém id)", () => {
    const event = scrubEvent({
      user: { id: "uuid-123", email: "maria@x.com", username: "maria", ip_address: "1.2.3.4" },
    });
    expect(event.user.email).toBeUndefined();
    expect(event.user.username).toBeUndefined();
    expect(event.user.ip_address).toBeUndefined();
    expect(event.user.id).toBe("uuid-123");
  });

  it("limpa cookies, authorization e querystring da request", () => {
    const event = scrubEvent({
      request: {
        cookies: { session: "abc" },
        headers: { authorization: "Bearer x", cookie: "s=1", "user-agent": "ua" },
        query_string: "email=maria@x.com&q=batom",
      },
    });
    expect(event.request.cookies).toBeUndefined();
    expect(event.request.headers.authorization).toBeUndefined();
    expect(event.request.headers.cookie).toBeUndefined();
    expect(event.request.headers["user-agent"]).toBe("ua");
    expect(event.request.query_string).toBe("email=[redacted]&q=batom");
  });

  it("redige PII em message, breadcrumbs e extra", () => {
    const event = scrubEvent({
      message: "falha ao notificar maria@x.com",
      breadcrumbs: [{ message: "tel 11988887777" }],
      extra: { nested: { phone: "+55 11 98888-7777" } },
    });
    expect(event.message).toBe("falha ao notificar [redacted]");
    expect(event.breadcrumbs[0]!.message).toContain("[redacted]");
    expect((event.extra.nested as { phone: string }).phone).toContain("[redacted]");
  });

  it("preserva o evento sem PII", () => {
    const event = scrubEvent({ message: "erro genérico" });
    expect(event.message).toBe("erro genérico");
  });
});
