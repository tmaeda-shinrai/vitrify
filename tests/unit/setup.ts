import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

import "@testing-library/jest-dom/vitest";

// Com globals: false, o auto-cleanup do Testing Library não se registra sozinho.
afterEach(() => cleanup());
