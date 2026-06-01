import type { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { connect, inRollback, setAnon, setUser, USERS, VITRINE_SLUG } from "./helpers";

// Suíte de RLS (#0004). Roda contra o Postgres do Supabase com o seed aplicado.
// Cada teste roda numa transação revertida; o setup (antes de trocar de role)
// executa como `postgres`, que bypassa RLS.

let db: Client;
let marianaVitrine: string;
let carlaVitrine: string;

beforeAll(async () => {
  db = await connect();
  const r = await db.query<{ slug: string; id: string }>(
    "SELECT slug, id FROM vitrines WHERE slug = ANY($1)",
    [[VITRINE_SLUG.mariana, VITRINE_SLUG.carla]],
  );
  marianaVitrine = r.rows.find((x) => x.slug === VITRINE_SLUG.mariana)?.id ?? "";
  carlaVitrine = r.rows.find((x) => x.slug === VITRINE_SLUG.carla)?.id ?? "";
  if (!marianaVitrine || !carlaVitrine) {
    throw new Error("Seed não encontrado: rode `supabase db reset` antes de `pnpm test:rls`.");
  }
});

afterAll(async () => {
  await db?.end();
});

async function count(sql: string, params: unknown[] = []): Promise<number> {
  const r = await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM (${sql}) sub`, params);
  return r.rows[0]?.n ?? 0;
}

describe("RLS · público (anon)", () => {
  it("lê produtos ativos de vitrine ativa", async () => {
    await inRollback(db, async () => {
      await setAnon(db);
      expect(await count("SELECT 1 FROM products WHERE vitrine_id=$1", [marianaVitrine])).toBe(13);
    });
  });

  it("NÃO lê produto inativo", async () => {
    await inRollback(db, async () => {
      await db.query(
        "INSERT INTO products (vitrine_id, name, price_cents, is_active) VALUES ($1,'rls-inativo',100,false)",
        [marianaVitrine],
      );
      await setAnon(db);
      expect(await count("SELECT 1 FROM products WHERE name='rls-inativo'")).toBe(0);
    });
  });

  it("NÃO lê vitrine inativa nem seus produtos", async () => {
    await inRollback(db, async () => {
      await db.query("UPDATE vitrines SET is_active=false WHERE id=$1", [marianaVitrine]);
      await setAnon(db);
      expect(await count("SELECT 1 FROM vitrines WHERE id=$1", [marianaVitrine])).toBe(0);
      expect(await count("SELECT 1 FROM products WHERE vitrine_id=$1", [marianaVitrine])).toBe(0);
    });
  });

  it("consegue INSERIR order_intent", async () => {
    await inRollback(db, async () => {
      await setAnon(db);
      const r = await db.query(
        "INSERT INTO order_intents (vitrine_id, source) VALUES ($1,'rls-test')",
        [marianaVitrine],
      );
      expect(r.rowCount).toBe(1);
    });
  });

  it("NÃO lê order_intents, subscriptions, invoices nem profiles", async () => {
    await inRollback(db, async () => {
      await setAnon(db);
      for (const t of ["order_intents", "subscriptions", "invoices", "profiles"]) {
        expect(await count(`SELECT 1 FROM ${t}`), t).toBe(0);
      }
    });
  });
});

describe("RLS · isolamento entre donas (Carla × Mariana)", () => {
  it("Carla NÃO atualiza produto da Mariana", async () => {
    await inRollback(db, async () => {
      await setUser(db, USERS.carla);
      const r = await db.query("UPDATE products SET name='HACKED' WHERE vitrine_id=$1", [
        marianaVitrine,
      ]);
      expect(r.rowCount).toBe(0);
    });
  });

  it("Carla NÃO deleta produto da Mariana", async () => {
    await inRollback(db, async () => {
      await setUser(db, USERS.carla);
      const r = await db.query("DELETE FROM products WHERE vitrine_id=$1", [marianaVitrine]);
      expect(r.rowCount).toBe(0);
    });
  });

  it("Carla LÊ produtos ativos da Mariana (vitrine é pública)", async () => {
    await inRollback(db, async () => {
      await setUser(db, USERS.carla);
      expect(await count("SELECT 1 FROM products WHERE vitrine_id=$1", [marianaVitrine])).toBe(13);
    });
  });

  it("Carla NÃO lê order_intents da Mariana", async () => {
    await inRollback(db, async () => {
      await setUser(db, USERS.carla);
      expect(await count("SELECT 1 FROM order_intents WHERE vitrine_id=$1", [marianaVitrine])).toBe(
        0,
      );
    });
  });

  it("Carla edita os PRÓPRIOS produtos", async () => {
    await inRollback(db, async () => {
      await setUser(db, USERS.carla);
      expect(await count("SELECT 1 FROM products WHERE vitrine_id=$1", [carlaVitrine])).toBe(5);
      const upd = await db.query(
        "UPDATE products SET display_order=display_order WHERE vitrine_id=$1",
        [carlaVitrine],
      );
      expect(upd.rowCount).toBe(5);
    });
  });
});

describe("RLS · subscriptions e profiles privados", () => {
  it("Carla lê só a própria subscription", async () => {
    await inRollback(db, async () => {
      await setUser(db, USERS.carla);
      const r = await db.query<{ owner_id: string }>("SELECT owner_id FROM subscriptions");
      expect(r.rowCount).toBe(1);
      expect(r.rows[0]?.owner_id).toBe(USERS.carla);
    });
  });

  it("Carla NÃO atualiza a própria subscription (sem policy de UPDATE)", async () => {
    await inRollback(db, async () => {
      await setUser(db, USERS.carla);
      const r = await db.query("UPDATE subscriptions SET plan='plus' WHERE owner_id=$1", [
        USERS.carla,
      ]);
      expect(r.rowCount).toBe(0);
    });
  });

  it("Carla lê só o próprio profile", async () => {
    await inRollback(db, async () => {
      await setUser(db, USERS.carla);
      const r = await db.query<{ id: string }>("SELECT id FROM profiles");
      expect(r.rowCount).toBe(1);
      expect(r.rows[0]?.id).toBe(USERS.carla);
    });
  });
});
