import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InstallPrompt } from "@/components/shared/install-prompt";

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));

function setUserAgent(ua: string) {
  Object.defineProperty(window.navigator, "userAgent", { value: ua, configurable: true });
}

function setStandalone(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches }) as unknown as typeof window.matchMedia;
}

describe("InstallPrompt", () => {
  beforeEach(() => {
    localStorage.clear();
    setStandalone(false);
    setUserAgent("Mozilla/5.0 (Linux; Android 14) Chrome");
  });
  afterEach(() => vi.restoreAllMocks());

  it("não renderiza nada quando já está instalado (standalone)", () => {
    setStandalone(true);
    const { container } = render(<InstallPrompt />);
    expect(container).toBeEmptyDOMElement();
  });

  it("mostra instruções no iOS Safari", () => {
    setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari");
    render(<InstallPrompt />);
    expect(screen.getByText("iosInstructions")).toBeInTheDocument();
  });

  it("oferece o botão de instalar só após beforeinstallprompt (Android)", () => {
    render(<InstallPrompt />);
    expect(screen.queryByRole("button", { name: "install" })).not.toBeInTheDocument();

    act(() => {
      const event = new Event("beforeinstallprompt") as Event & {
        prompt: () => Promise<void>;
        userChoice: Promise<{ outcome: string }>;
      };
      event.prompt = vi.fn().mockResolvedValue(undefined);
      event.userChoice = Promise.resolve({ outcome: "accepted" });
      window.dispatchEvent(event);
    });

    expect(screen.getByRole("button", { name: "install" })).toBeInTheDocument();
  });

  it("não reaparece após dispensar (persiste no localStorage)", () => {
    setUserAgent("Mozilla/5.0 (iPhone) Safari");
    render(<InstallPrompt />);
    fireEvent.click(screen.getByRole("button", { name: "dismiss" }));
    expect(localStorage.getItem("vitrinio:install-dismissed")).toBe("1");
    expect(screen.queryByText("iosInstructions")).not.toBeInTheDocument();
  });
});
