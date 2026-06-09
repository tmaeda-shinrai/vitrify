import { expect, test } from "@playwright/test";

import { loginAs, SEED, uploadProductPhoto, withDb } from "./helpers";

/**
 * Fluxo crítico (#0024): a dona cadastra um produto com foto (upload real ao
 * Storage local) e ele aparece na vitrine pública. Usa a Mariana (Pro, sem limite)
 * e um nome único com prefixo "E2E " para limpeza no `afterEach`.
 */
const PRODUCT_NAME = `E2E Batom ${Date.now()}`;

test.afterEach(async () => {
  await withDb((c) => c.query("delete from products where name like 'E2E %'"));
});

test("cadastra produto com foto e ele aparece na vitrine pública", async ({ page }) => {
  // Fluxo longo (login + upload + vitrine), cada rota com compilação a frio.
  test.setTimeout(120_000);
  await loginAs(page, SEED.mariana.email);
  await page.goto("/produtos");

  await page.getByRole("button", { name: /adicionar produto/i }).click();
  await uploadProductPhoto(page);
  await page.locator("#name").fill(PRODUCT_NAME);
  await page.locator("#price").fill("49,90");
  await page.getByRole("button", { name: "Salvar produto", exact: true }).click();

  // Volta para a listagem do painel com o produto novo.
  await expect(page.getByText(PRODUCT_NAME)).toBeVisible();

  // A vitrine pública (ISR revalidada no cadastro) mostra o produto.
  await page.goto(`/${SEED.mariana.slug}`);
  await expect(page.getByText(PRODUCT_NAME)).toBeVisible();
});
