import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { recordVitrineView } from "@/lib/view";

describe("recordVitrineView", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.stubGlobal("navigator", { sendBeacon: vi.fn() });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("dispara o beacon uma vez por sessão (deduplica reload)", () => {
    recordVitrineView("maria");
    recordVitrineView("maria");
    expect(navigator.sendBeacon).toHaveBeenCalledTimes(1);
    expect(navigator.sendBeacon).toHaveBeenCalledWith("/api/view", expect.any(Blob));
  });

  it("conta slugs diferentes separadamente", () => {
    recordVitrineView("maria");
    recordVitrineView("joana");
    expect(navigator.sendBeacon).toHaveBeenCalledTimes(2);
  });
});
