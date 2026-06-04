import { beforeEach, describe, expect, it, vi } from "vitest";

const SECRET = "supersecretsupersecretsupersecret32";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let fakeAdmin: any;

vi.mock("@/lib/env", () => ({
  // Literal (não pode referenciar variáveis externas: a factory é hoisted).
  serverEnv: { ASAAS_WEBHOOK_SECRET: "supersecretsupersecretsupersecret32" },
  clientEnv: {},
}));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => fakeAdmin }));

import { POST } from "./route";

interface FakeOpts {
  subscriptions?: Array<Record<string, unknown>>;
  eventInsertError?: { code: string } | null;
}

function makeFakeAdmin(opts: FakeOpts = {}) {
  const subscriptions = opts.subscriptions ?? [];
  const calls = {
    eventInserts: [] as unknown[],
    upserts: [] as Array<{ table: string; row: Record<string, unknown> }>,
    updates: [] as Array<{ table: string; patch: Record<string, unknown> }>,
    deletes: [] as Array<{ table: string; value: unknown }>,
  };

  const from = (table: string) => ({
    insert(row: Record<string, unknown>) {
      if (table === "payment_webhook_events") calls.eventInserts.push(row);
      return Promise.resolve({ error: opts.eventInsertError ?? null });
    },
    upsert(row: Record<string, unknown>) {
      calls.upserts.push({ table, row });
      return Promise.resolve({ error: null });
    },
    select() {
      return {
        eq(col: string, value: unknown) {
          return {
            maybeSingle() {
              const data = subscriptions.find((s) => s[col] === value) ?? null;
              return Promise.resolve({ data, error: null });
            },
          };
        },
      };
    },
    update(patch: Record<string, unknown>) {
      return {
        eq() {
          calls.updates.push({ table, patch });
          return Promise.resolve({ error: null });
        },
      };
    },
    delete() {
      return {
        eq(_col: string, value: unknown) {
          calls.deletes.push({ table, value });
          return Promise.resolve({ error: null });
        },
      };
    },
  });

  return { from, __calls: calls };
}

function makeRequest(body: unknown, token: string | null = SECRET) {
  const headers = new Headers({ "content-type": "application/json" });
  if (token !== null) headers.set("asaas-access-token", token);
  return {
    headers,
    json: async () => body,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

const confirmedPayload = {
  id: "evt_1",
  event: "PAYMENT_CONFIRMED",
  payment: {
    id: "pay_1",
    customer: "cus_1",
    subscription: "sub_asaas_1",
    value: 39.0,
    status: "CONFIRMED",
    billingType: "PIX",
    invoiceUrl: "https://asaas.com/i/pay_1",
    dueDate: "2026-06-10",
    confirmedDate: "2026-06-09",
  },
};

beforeEach(() => {
  fakeAdmin = makeFakeAdmin();
});

describe("POST /api/webhooks/asaas — autenticação", () => {
  it("rejeita token inválido com 401", async () => {
    const res = await POST(makeRequest(confirmedPayload, "token-errado"));
    expect(res.status).toBe(401);
    expect(fakeAdmin.__calls.eventInserts).toHaveLength(0);
  });

  it("rejeita ausência de token com 401", async () => {
    const res = await POST(makeRequest(confirmedPayload, null));
    expect(res.status).toBe(401);
  });
});

describe("POST /api/webhooks/asaas — processamento", () => {
  it("PAYMENT_CONFIRMED ativa a assinatura e grava a fatura", async () => {
    fakeAdmin = makeFakeAdmin({
      subscriptions: [{ id: "sub-row-1", plan: "free", asaas_subscription_id: "sub_asaas_1" }],
    });

    const res = await POST(makeRequest(confirmedPayload));
    expect(res.status).toBe(200);

    const invoice = fakeAdmin.__calls.upserts.find(
      (u: { table: string }) => u.table === "invoices",
    );
    expect(invoice?.row).toMatchObject({
      subscription_id: "sub-row-1",
      asaas_payment_id: "pay_1",
      amount_cents: 3900,
      status: "paid",
      payment_method: "pix",
    });

    const update = fakeAdmin.__calls.updates.find(
      (u: { table: string }) => u.table === "subscriptions",
    );
    expect(update?.patch).toMatchObject({ status: "active", plan: "pro" });
  });

  it("resolve a assinatura pelo customer quando não há subscription", async () => {
    fakeAdmin = makeFakeAdmin({
      subscriptions: [{ id: "sub-row-1", plan: "free", asaas_customer_id: "cus_1" }],
    });
    const payload = {
      ...confirmedPayload,
      payment: { ...confirmedPayload.payment, subscription: null },
    };

    const res = await POST(makeRequest(payload));
    expect(res.status).toBe(200);
    expect(fakeAdmin.__calls.updates).toHaveLength(1);
  });

  it("evento duplicado (23505) é idempotente: não toca em invoices/subscriptions", async () => {
    fakeAdmin = makeFakeAdmin({
      subscriptions: [{ id: "sub-row-1", plan: "free", asaas_subscription_id: "sub_asaas_1" }],
      eventInsertError: { code: "23505" },
    });

    const res = await POST(makeRequest(confirmedPayload));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ idempotent: true });
    expect(fakeAdmin.__calls.upserts).toHaveLength(0);
    expect(fakeAdmin.__calls.updates).toHaveLength(0);
  });

  it("payload inválido retorna 400", async () => {
    const res = await POST(makeRequest({ foo: "bar" }));
    expect(res.status).toBe(400);
  });
});
