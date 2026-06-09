import { expect, test } from "@playwright/test";

import { uploadProductPhoto, withDb } from "./helpers";

/**
 * Fluxo crítico (#0024): cadastro → onboarding → 1º produto. Cobre a jornada
 * completa de uma nova usuária. O Supabase local exige confirmação de e-mail; como
 * não há caixa de entrada, confirmamos o e-mail direto no banco (passo de infra,
 * não a feature em teste) e seguimos pelo login normal.
 */
const STAMP = Date.now();
const EMAIL = `e2e-${STAMP}@vitrinio.dev`;
const PASSWORD = "Vitrinio@2026";
const SLUG = `e2e${STAMP}`;
const PRODUCT_NAME = `E2E Primeiro ${STAMP}`;

test.afterEach(async () => {
  // Remove a usuária de teste (cascata limpa vitrine/produtos) e o produto.
  await withDb(async (c) => {
    await c.query("delete from auth.users where email like 'e2e-%@vitrinio.dev'");
    await c.query("delete from products where name like 'E2E %'");
  });
});

test("cadastro → onboarding → primeiro produto", async ({ page }) => {
  test.setTimeout(150_000);

  // 1) Cadastro
  await page.goto("/cadastro");
  await page.locator("#fullName").fill("E2E Tester");
  await page.locator("#email").fill(EMAIL);
  await page.locator("#password").fill(PASSWORD);
  await page.locator("#confirmPassword").fill(PASSWORD);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Criar conta", exact: true }).click();
  await page.waitForURL("**/cadastro/verifique-email");

  // 2) Confirma o e-mail no banco (sem caixa de entrada no local).
  await withDb((c) =>
    c.query("update auth.users set email_confirmed_at = now() where email = $1", [EMAIL]),
  );

  // 3) O cadastro já autentica a sessão; a guarda de rota leva ao onboarding
  // (perfil ainda sem onboarding_completed_at).
  await page.goto("/produtos");
  await page.waitForURL("**/onboarding");

  // 4) Onboarding — nome (pré-preenchido), slug, whatsapp, foto.
  await page.getByRole("button", { name: "Continuar", exact: true }).click();

  await page.locator("#slug").fill(SLUG);
  await expect(page.getByText("Disponível!")).toBeVisible();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();

  await page.locator("#whatsapp").fill("67999990000");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();

  await page.getByRole("button", { name: "Concluir", exact: true }).click();
  await page.waitForURL(/\/produtos/);

  // 5) Card de boas-vindas (bemvinda=1): dispensa.
  await page.getByRole("button", { name: "Ver depois", exact: true }).click();

  // 6) Primeiro produto com foto (vitrine vazia tem o botão no header e no empty state).
  await page
    .getByRole("button", { name: /adicionar produto/i })
    .first()
    .click();
  await uploadProductPhoto(page);
  await page.locator("#name").fill(PRODUCT_NAME);
  await page.locator("#price").fill("29,90");
  await page.getByRole("button", { name: "Salvar produto", exact: true }).click();

  await expect(page.getByText(PRODUCT_NAME)).toBeVisible();
});
