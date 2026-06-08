import { expect, test } from "@playwright/test";

import { loginAs, SEED, withDb } from "./helpers";

/**
 * Fluxo crítico (#0024): assinatura cancelada mantém o acesso até o fim do período
 * já pago. O cancelamento real passa pelo gateway (Asaas); aqui validamos o
 * comportamento observável a partir do estado no banco (decisão de mockar o gateway):
 * `canceled_at` definido + `current_period_end` no futuro → painel mostra o aviso.
 */
test.afterEach(async () => {
  // Restaura o baseline do seed (Mariana ativa, sem cancelamento).
  await withDb((c) =>
    c.query(
      "update subscriptions set canceled_at = null, status = 'active', current_period_end = now() + interval '30 days' where owner_id = $1",
      [SEED.mariana.uid],
    ),
  );
});

test("assinatura cancelada mantém acesso até o fim do período", async ({ page }) => {
  await withDb((c) =>
    c.query(
      "update subscriptions set canceled_at = now(), status = 'active', current_period_end = now() + interval '20 days' where owner_id = $1",
      [SEED.mariana.uid],
    ),
  );

  await loginAs(page, SEED.mariana.email);
  await page.goto("/conta/plano");

  await expect(page.getByText(/acesso garantido até/i)).toBeVisible();
});
