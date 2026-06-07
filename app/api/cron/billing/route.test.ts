import { beforeEach, describe, expect, it, vi } from "vitest";

const SECRET = "cronsecretcronsecret32xx";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let fakeAdmin: any;

vi.mock("@/lib/env", () => ({
  serverEnv: { CRON_SECRET: "cronsecretcronsecret32xx" },
  clientEnv: {},
}));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => fakeAdmin }));
vi.mock("@/lib/email/recipient", () => ({ getUserEmail: vi.fn(async () => "user@example.com") }));
vi.mock("@/lib/email/client", () => ({ sendEmail: vi.fn(async () => {}) }));

import { POST } from "./route";

interface FakeOptions {
  profiles?: Array<{ id: string }>;
  paidOwners?: string[];
}

function makeFakeAdmin(subs: Array<Record<string, unknown>>, opts: FakeOptions = {}) {
  const { profiles = [], paidOwners = [] } = opts;
  const updates: Array<{ patch: Record<string, unknown>; id: unknown }> = [];
  const stamped: unknown[] = [];

  function makeBuilder(table: string) {
    const ctx = { paidQuery: false };
    const data = () => (table === "profiles" ? profiles : subs);
    const builder = {
      select: (cols?: string) => {
        if (table === "subscriptions" && cols === "owner_id") ctx.paidQuery = true;
        return builder;
      },
      neq: () => builder,
      or: () => builder,
      is: () => builder,
      eq: () => builder,
      gte: () => builder,
      lt: () => builder,
      in: () => builder,
      limit: () => Promise.resolve({ data: data(), error: null }),
      update: (patch: Record<string, unknown>) => ({
        eq: (_col: string, id: unknown) => {
          if (table === "profiles") stamped.push(id);
          else updates.push({ patch, id });
          return Promise.resolve({ error: null });
        },
      }),
      // Thenable: cobre a query de paidSubs (`.in(...).in(...)` awaited).
      then: (resolve: (v: unknown) => void) =>
        resolve({
          data: ctx.paidQuery ? paidOwners.map((owner_id) => ({ owner_id })) : data(),
          error: null,
        }),
    };
    return builder;
  }

  return { from: (table: string) => makeBuilder(table), __updates: updates, __stamped: stamped };
}

function makeRequest(token: string | null = SECRET) {
  const headers = new Headers();
  if (token !== null) headers.set("x-cron-secret", token);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { headers, json: async () => ({}) } as any;
}

beforeEach(() => {
  vi.clearAllMocks();
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

  it("rebaixa trial de indicação vencido para free/expired", async () => {
    const old = new Date(Date.now() - 40 * 86_400_000).toISOString();
    fakeAdmin = makeFakeAdmin([
      {
        id: "t",
        plan: "pro",
        status: "trialing",
        past_due_since: null,
        canceled_at: null,
        current_period_end: old,
      },
    ]);

    const res = await POST(makeRequest());
    expect(await res.json()).toMatchObject({ downgraded: 1 });
    expect(fakeAdmin.__updates[0].patch).toMatchObject({ plan: "free", status: "expired" });
  });

  it("envia nudge de indicação só para Pro+ no fim da janela e carimba", async () => {
    fakeAdmin = makeFakeAdmin([], {
      profiles: [{ id: "p1" }, { id: "p2" }],
      paidOwners: ["p1"], // só p1 está em Pro+
    });

    const res = await POST(makeRequest());
    expect(await res.json()).toMatchObject({ nudgeSent: 1 });
    expect(fakeAdmin.__stamped).toEqual(["p1"]);
  });
});
