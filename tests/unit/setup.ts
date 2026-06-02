import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

import "@testing-library/jest-dom/vitest";

// Com globals: false, o auto-cleanup do Testing Library não se registra sozinho.
afterEach(() => cleanup());

// jsdom não implementa ResizeObserver, usado por componentes Radix (ex.: Switch).
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
