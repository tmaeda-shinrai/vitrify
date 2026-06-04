import { beforeEach, describe, expect, it, vi } from "vitest";

const SECRET = "cronsecretcronsecret32xx";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let fakeAdmin: any;

vi.mock("@/lib/env", () => ({
  serverEnv: { CRON_SECRET: "cronsecretcronsecret32xx" },
  clientEnv: {},
}));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => fakeAdmin }));

import { POST } from "./route";

function makeFakeAdmin(subs: Array<Record<string, unknown>>) {
  const updates: Array<{ patch: Record<string, unknown>; id: unknown }> = [];
  const builder = {
    select: () => builder,
    neq: () => builder,
    or: () => builder,
    limit: () => Promise.resolve({ data: subs, error: null }),
    update: (patch: Record<string, unknown>) => ({
      eq: (_col: string, id: unknown) => {
        updates.push({ patch, id });
        return Promise.resolve({ error: null });
      },
    }),
  };
  return { from: () => builder, __updates: updates };
}

function makeRequest(token: string | null = SECRET) {
  const headers = new Headers();
  if (token !== null) headers.set("x-cron-secret", token);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { headers, json: async () => ({}) } as any;
}

beforeEach(() => {
  fakeAdmin = makeFakeAdmin([]);
});

describe("POST /api/cron/billing", () => {
  it("rejeita segredo inválido com 401", async () => {
    const res = await POST(makeRequest("errado"));
    expect(res.status).toBe(401);
  });

  it("rejeita ausência de segredo com 401", async () => {
    const res = await POST(makeRequest(null));
    expect(res.status).toBe(401);
  });

  it("rebaixa past_due ≥30d e cancelada vencida; ignora as demais", async () => {
    const old = new Date(Date.now() - 40 * 86_400_000).toISOString();
    const recent = new Date(Date.now() - 5 * 86_400_000).toISOString();
    fakeAdmin = makeFakeAdmin([
      {
        id: "a",
        plan: "pro",
        status: "past_due",
        past_due_since: old,
        canceled_at: null,
        current_period_end: null,
      },
      {
        id: "b",
        plan: "plus",
        status: "active",
        past_due_since: null,
        canceled_at: old,
        current_period_end: old,
      },
      {
        id: "c",
        plan: "pro",
        status: "past_due",
        past_due_since: recent,
        canceled_at: null,
        current_period_end: null,
      },
    ]);

    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ downgraded: 2 });

    const ids = fakeAdmin.__updates.map((u: { id: string }) => u.id).sort();
    expect(ids).toEqual(["a", "b"]);
    const aPatch = fakeAdmin.__updates.find((u: { id: string }) => u.id === "a")!.patch;
    expect(aPatch).toMatchObject({ plan: "free", status: "expired", past_due_since: null });
  });
});
