import { fileURLToPath } from "node:url";
import path from "node:path";

import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Suíte de RLS: roda contra um Postgres do Supabase (local 54322 ou CI).
// Separada do `pnpm test` (unit/jsdom) porque depende de banco — use `pnpm test:rls`.
export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["tests/rls/**/*.test.ts"],
    testTimeout: 20000,
    hookTimeout: 20000,
    // Sem paralelismo entre arquivos: cada teste abre transação no mesmo banco.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
});
