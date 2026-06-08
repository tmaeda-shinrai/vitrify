import { expect, test } from "@playwright/test";

import { loginAs, SEED, withDb } from "./helpers";

/**
 * Fluxo crítico (#0024): usuária Free no limite (Carla, 5/5) vê o aviso de upgrade;
 * ao virar Pro (estado de plano alterado no banco — sem checkout real, conforme a
 * decisão de mockar o gateway), o limite some e o cadastro fica liberado.
 */
test.afterEach(async () => {
  // Restaura o baseline do seed (Carla é Free).
  await withDb((c) =>
    c.query("update subscriptions set plan = 'free' where owner_id = $1", [SEED.carla.uid]),
  );
});

test("Free no limite vê o aviso; ao virar Pro o limite some", async ({ page }) => {
  await loginAs(page, SEED.carla.email);
  await page.goto("/produtos");

  // Free 5/5: banner de limite atingido visível.
  await expect(page.getByText(/atingiu o limite/i)).toBeVisible();

  // "Upgrade" via banco (mock do gateway).
  await withDb((c) =>
    c.query("update subscriptions set plan = 'pro' where owner_id = $1", [SEED.carla.uid]),
  );
  await page.reload();

  // Pro: sem aviso de limite e com o cadastro de produto disponível.
  await expect(page.getByText(/atingiu o limite/i)).toHaveCount(0);
  await expect(page.getByRole("button", { name: /adicionar produto/i }).first()).toBeVisible();
});
