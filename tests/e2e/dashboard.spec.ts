import { expect, test } from "@playwright/test";

test.describe("Shell do dashboard", () => {
  test("acessar /produtos sem sessão redireciona para /login", async ({ page }) => {
    await page.goto("/produtos");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText("Acesse sua vitrine.")).toBeVisible();
  });

  test("rotas do painel sem sessão caem no login", async ({ page }) => {
    for (const path of ["/pedidos", "/estatisticas", "/conta"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login$/);
    }
  });

  test("acessar /onboarding sem sessão redireciona para /login", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/login$/);
  });
});
