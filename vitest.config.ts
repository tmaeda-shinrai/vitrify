import { fileURLToPath } from "node:url";
import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./tests/unit/setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["tests/e2e/**", "tests/rls/**", "node_modules", ".next", "playwright-report"],
    css: false,
  },
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
});
