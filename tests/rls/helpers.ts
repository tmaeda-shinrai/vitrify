import { Client } from "pg";

// Banco alvo: stack local do Supabase (54322) por padrão; CI sobrescreve via env.
export const DB_URL =
  process.env.SUPABASE_DB_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

// IDs fixos das personas do seed (supabase/seed.sql).
export const USERS = {
  mariana: "11111111-1111-1111-1111-111111111111", // Pro
  carla: "22222222-2222-2222-2222-222222222222", // Free
  joana: "33333333-3333-3333-3333-333333333333", // Free
} as const;

export const VITRINE_SLUG = {
  mariana: "mariana-cosmeticos",
  carla: "carla-natura",
  joana: "joana-avon",
} as const;

export async function connect(): Promise<Client> {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  return client;
}

// Aplica o contexto RLS de anônimo na transação atual.
export async function setAnon(client: Client): Promise<void> {
  await client.query("SET LOCAL ROLE anon");
  await client.query("SELECT set_config('request.jwt.claims', $1, true)", [
    JSON.stringify({ role: "anon" }),
  ]);
}

// Aplica o contexto RLS de uma usuária autenticada (auth.uid() = uid).
export async function setUser(client: Client, uid: string): Promise<void> {
  await client.query("SET LOCAL ROLE authenticated");
  await client.query("SELECT set_config('request.jwt.claims', $1, true)", [
    JSON.stringify({ sub: uid, role: "authenticated" }),
  ]);
}

// Roda fn dentro de uma transação que SEMPRE faz ROLLBACK (isola cada teste).
// O que rodar antes de setAnon/setUser executa como `postgres` (bypassa RLS),
// útil para montar fixtures (ex.: produto inativo) que somem no rollback.
export async function inRollback<T>(client: Client, fn: () => Promise<T>): Promise<T> {
  await client.query("BEGIN");
  try {
    return await fn();
  } finally {
    await client.query("ROLLBACK");
  }
}
