import { expect, test } from "@playwright/test";

test.describe("Autenticação", () => {
  test("a página de login renderiza e valida campos", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("Acesse sua vitrine.")).toBeVisible();

    // Submeter vazio dispara a validação client-side (Zod + RHF).
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText("Informe seu e-mail.")).toBeVisible();
  });

  test("login com credenciais inválidas mostra erro claro", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("E-mail").fill("inexistente@example.com");
    await page.getByLabel("Senha").fill("senhaErrada123");
    await page.getByRole("button", { name: "Entrar" }).click();

    // Toast de erro (sonner): credenciais inválidas ou, se o rate-limit por IP já
    // foi atingido em execuções repetidas, a mensagem de "muitas tentativas".
    await expect(page.getByText(/incorretos|muitas tentativas/i)).toBeVisible();
  });

  test("o cadastro renderiza e valida senha fraca", async ({ page }) => {
    await page.goto("/cadastro");

    await expect(page.getByText("Monte sua vitrine em minutos.")).toBeVisible();

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

  test("o botão Continuar com Google aparece em login e cadastro", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: "Continuar com Google" })).toBeVisible();

    await page.goto("/cadastro");
    await expect(page.getByRole("button", { name: "Continuar com Google" })).toBeVisible();
  });

  test("cancelar o login com Google mostra toast amigável", async ({ page }) => {
    await page.goto("/login?erro=oauth-cancelado");
    await expect(page.getByText(/login com google cancelado/i)).toBeVisible();
  });
});
