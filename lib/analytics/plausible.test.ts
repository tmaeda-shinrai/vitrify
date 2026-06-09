import { afterEach, describe, expect, it, vi } from "vitest";

import { trackEvent } from "./plausible";

describe("trackEvent", () => {
  afterEach(() => {
    delete window.plausible;
  });

  it("envia o evento e as props para window.plausible", () => {
    const spy = vi.fn();
    window.plausible = spy;
    trackEvent("Signup", { method: "email" });
    expect(spy).toHaveBeenCalledWith("Signup", { props: { method: "email" } });
  });

  it("sem props passa undefined", () => {
    const spy = vi.fn();
    window.plausible = spy;
    trackEvent("Onboarding completed");
    expect(spy).toHaveBeenCalledWith("Onboarding completed", undefined);
  });

  it("é no-op quando o Plausible ainda não carregou", () => {
    expect(() => trackEvent("Product created", { total: 1 })).not.toThrow();
  });
});
