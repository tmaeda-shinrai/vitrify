import { fileURLToPath } from "node:url";
import path from "node:path";

import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./tests/unit/setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["tests/e2e/**", "node_modules", ".next", "playwright-report"],
    css: false,
  },
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
});
