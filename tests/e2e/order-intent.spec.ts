import { expect, test } from "@playwright/test";

import { SEED, withDb } from "./helpers";

/**
 * Fluxo crítico (#0024): cliente abre uma vitrine pública, clica em "Pedir no
 * WhatsApp" e a intenção de pedido é registrada (POST /api/intent → order_intents).
 * Vitrine só-leitura (joana-avon), então não suja o estado de outros testes.
 */
test("cliente clica em Pedir no WhatsApp e a intenção é registrada", async ({ page, context }) => {
  const slug = SEED.joana.slug;

  // O botão abre o WhatsApp em nova aba (wa.me); aborta a navegação externa.
  await context.route(/wa\.me/, (route) => route.abort());

  const before = await withDb(async (c) => {
    const { rows } = await c.query<{ n: string }>(
      "select count(*)::text as n from order_intents oi join vitrines v on v.id = oi.vitrine_id where v.slug = $1",
      [slug],
    );
    return Number(rows[0]!.n);
  });

  await page.goto(`/${slug}`);

  const button = page.getByRole("link", { name: /pedir no whatsapp/i }).first();
  await expect(button).toBeVisible();

  const intentResponse = page.waitForResponse(
    (res) => res.url().includes("/api/intent") && res.request().method() === "POST",
  );
  await button.click();
  const res = await intentResponse;
  expect(res.status()).toBeLessThan(300);

  const after = await withDb(async (c) => {
    const { rows } = await c.query<{ n: string }>(
      "select count(*)::text as n from order_intents oi join vitrines v on v.id = oi.vitrine_id where v.slug = $1",
      [slug],
    );
    return Number(rows[0]!.n);
  });
  expect(after).toBeGreaterThan(before);
});
