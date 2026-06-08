import { beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let inserts: any[] = [];
let vitrineRow: { id: string } | null = { id: "v1" };

vi.mock("@/lib/rate-limit", () => ({
  getClientIp: () => "1.2.3.4",
  checkReportRateLimit: vi.fn(async () => ({ success: true, remaining: 5 })),
}));
vi.mock("@/lib/email/client", () => ({ sendEmail: vi.fn(async () => {}) }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from(table: string) {
      if (table === "vitrines") {
        return {
          select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: vitrineRow }) }) }),
        };
      }
      return {
        insert: async (row: unknown) => {
          inserts.push(row);
          return { error: null };
        },
      };
    },
  }),
}));

import { sendEmail } from "@/lib/email/client";

import { POST } from "./route";

const sendEmail_ = vi.mocked(sendEmail);

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/report", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/report", () => {
  beforeEach(() => {
    inserts = [];
    vitrineRow = { id: "v1" };
    sendEmail_.mockClear();
  });

  it("cria registro e notifica direitos@ com payload válido", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await POST(makeRequest({ slug: "maria", reason: "copyright" }) as any);
    expect(res.status).toBe(200);
    expect(inserts).toHaveLength(1);
    expect(inserts[0].vitrine_id).toBe("v1");
    expect(sendEmail_).toHaveBeenCalledOnce();
  });

  it("rejeita payload inválido com 400", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await POST(makeRequest({ slug: "maria", reason: "nope" }) as any);
    expect(res.status).toBe(400);
    expect(inserts).toHaveLength(0);
  });

  it("resposta neutra (200) sem inserir quando a vitrine não existe", async () => {
    vitrineRow = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await POST(makeRequest({ slug: "naoexiste", reason: "spam" }) as any);
    expect(res.status).toBe(200);
    expect(inserts).toHaveLength(0);
    expect(sendEmail_).not.toHaveBeenCalled();
  });
});
