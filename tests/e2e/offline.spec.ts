import { expect, test } from "@playwright/test";

// Fallback offline do PWA (#0017). O service worker em si fica desabilitado em
// dev (Serwist `disable` quando NODE_ENV !== production), então o comportamento
// offline real (vitrine reabrindo sem internet) é verificado manualmente sobre
// um build de produção. Aqui garantimos que a página de fallback renderiza.
test("a página de fallback offline mostra a mensagem de sem conexão", async ({ page }) => {
  await page.goto("/~offline");

  await expect(page.getByRole("heading", { name: /sem conexão/i })).toBeVisible();
});
