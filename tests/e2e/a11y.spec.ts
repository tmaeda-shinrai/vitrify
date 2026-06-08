import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Smoke de acessibilidade (#0024, WCAG 2.1 AA). Roda o axe-core nas rotas públicas
 * que não dependem de sessão/banco e falha se houver violação **séria ou crítica**.
 * As telas autenticadas e a vitrine pública (que precisam de seed) ficam para a
 * suíte E2E com Supabase no CI (#0024 PR de E2E).
 */
const ROUTES = [
  "/",
  "/login",
  "/cadastro",
  "/recuperar-senha",
  "/ajuda",
  "/termos",
  "/privacidade",
  "/cookies",
];

async function seriousViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
}

for (const route of ROUTES) {
  test(`sem violações sérias de acessibilidade em ${route}`, async ({ page }) => {
    // Margem p/ a compilação a frio do Next em dev (a 1ª visita a cada rota é lenta).
    test.setTimeout(90_000);
    await page.goto(route, { waitUntil: "load", timeout: 60_000 });
    const violations = await seriousViolations(page);
    expect(
      violations,
      JSON.stringify(
        violations.map((v) => ({ id: v.id, nodes: v.nodes.length })),
        null,
        2,
      ),
    ).toEqual([]);
  });
}
