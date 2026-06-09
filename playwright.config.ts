import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // Margem p/ a compilação a frio do `next dev` (a 1ª visita a cada rota é lenta).
  timeout: 90_000,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm next dev -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
    timeout: 120_000,
    // NODE_ENV=test faz o Next carregar `.env.test` (Supabase local) e IGNORAR o
    // `.env.local` (remoto), garantindo que as NEXT_PUBLIC_* entrem no bundle do
    // cliente — `supabase start` precisa estar no ar.
    env: {
      NODE_ENV: "test",
    },
  },
});
