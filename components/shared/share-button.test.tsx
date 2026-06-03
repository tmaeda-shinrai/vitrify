import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";

import { ShareButton } from "@/components/shared/share-button";

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("ShareButton", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it("usa navigator.share quando disponível", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { share });
    render(<ShareButton url="https://x/maria" title="Maria" />);
    fireEvent.click(screen.getByRole("button", { name: "share" }));
    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({ title: "Maria", url: "https://x/maria" }),
    );
  });

  it("copia o link e dá toast quando não há Web Share", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render(<ShareButton url="https://x/maria" />);
    fireEvent.click(screen.getByRole("button", { name: "share" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("https://x/maria"));
    expect(toast.success).toHaveBeenCalledWith("linkCopied");
  });
});
