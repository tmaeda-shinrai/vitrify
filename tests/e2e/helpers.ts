import { Client } from "pg";
import { expect, type Page } from "@playwright/test";

/**
 * Helpers dos E2E críticos (#0024). Os fluxos autenticados e os que dependem de
 * estado de plano rodam contra o Supabase **local** (seed em `supabase/seed.sql`),
 * que o job de CI sobe antes da suíte. A senha e os IDs/slugs abaixo são do seed.
 */
export const DB_URL =
  process.env.SUPABASE_DB_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

export const SEED = {
  password: "vitrinio123",
  // Pro, 13 produtos.
  mariana: {
    uid: "11111111-1111-1111-1111-111111111111",
    email: "mariana@vitrinio.dev",
    slug: "mariana-cosmeticos",
  },
  // Free, 5/5 produtos (no limite).
  carla: {
    uid: "22222222-2222-2222-2222-222222222222",
    email: "carla@vitrinio.dev",
    slug: "carla-natura",
  },
  // Free, 5 produtos — usada como vitrine só-leitura.
  joana: {
    uid: "33333333-3333-3333-3333-333333333333",
    email: "joana@vitrinio.dev",
    slug: "joana-avon",
  },
} as const;

/** Abre uma conexão pg, roda `fn` e sempre fecha. */
export async function withDb<T>(fn: (c: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

/** Faz login pela UI (e-mail/senha do seed) e espera o redirect ao painel. */
export async function loginAs(page: Page, email: string, password: string = SEED.password) {
  await page.goto("/login");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL("**/produtos");
  await expect(page).toHaveURL(/\/produtos/);
}

/** Imagem de produto usada nos uploads dos E2E (relativa à raiz do repo). */
export const FIXTURE_IMAGE = "tests/e2e/fixtures/product.png";

/**
 * Envia uma foto pelo `ImageUploader` aberto na tela: seleciona o arquivo, confirma
 * o recorte ("Salvar") e espera a foto entrar na lista (o input de descrição aparece).
 */
export async function uploadProductPhoto(page: Page) {
  await page.locator('input[type="file"]').first().setInputFiles(FIXTURE_IMAGE);
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Ajuste a foto")).toBeVisible();
  await dialog.getByRole("button", { name: "Salvar", exact: true }).click();
  // Após o upload (onUploaded), a 1ª foto entra na lista e ganha o campo de descrição.
  await expect(page.getByLabel(/descrição da foto 1/i)).toBeVisible({ timeout: 30_000 });
}
