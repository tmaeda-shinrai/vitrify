import { expect, test } from "@playwright/test";

test.describe("Autenticação", () => {
  test("a página de login renderiza e valida campos", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();

    // Submeter vazio dispara a validação client-side (Zod + RHF).
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText("Informe seu e-mail.")).toBeVisible();
  });

  test("login com credenciais inválidas mostra erro claro", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("E-mail").fill("inexistente@example.com");
    await page.getByLabel("Senha").fill("senhaErrada123");
    await page.getByRole("button", { name: "Entrar" }).click();

    // Toast de erro (sonner) com mensagem amigável.
    await expect(page.getByText("E-mail ou senha incorretos.")).toBeVisible();
  });

  test("o cadastro renderiza e valida senha fraca", async ({ page }) => {
    await page.goto("/cadastro");

    await expect(page.getByRole("heading", { name: "Criar conta" })).toBeVisible();

    await page.getByLabel("Nome").fill("Maria Teste");
    await page.getByLabel("E-mail").fill("maria@example.com");
    await page.getByLabel("Senha", { exact: true }).fill("123");
    await page.getByLabel("Confirmar senha").fill("123");
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page.getByText(/ao menos 8 caracteres/)).toBeVisible();
  });

  test("recuperar senha mostra confirmação neutra", async ({ page }) => {
    await page.goto("/recuperar-senha");

    await page.getByLabel("E-mail").fill("qualquer@example.com");
    await page.getByRole("button", { name: "Enviar link de recuperação" }).click();

    await expect(page.getByText(/enviamos um link para redefinir a senha/i)).toBeVisible();
  });
});
