import { expect, test } from "@playwright/test";

test("a landing carrega e exibe a marca Vitrinio", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Vitrinio/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: /começar/i })).toBeVisible();
});
