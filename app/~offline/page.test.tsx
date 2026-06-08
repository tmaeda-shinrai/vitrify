import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import OfflinePage from "@/app/~offline/page";

// A página é um Server Component async que usa getTranslations: mockamos a
// versão server para ler as mensagens reais e renderizamos o JSX resolvido.
vi.mock("next-intl/server", () => ({
  getTranslations: async (ns: string) => {
    const messages = (await import("@/messages/pt-BR.json")).default as unknown as Record<
      string,
      Record<string, string>
    >;
    return (k: string) => messages[ns]?.[k] ?? k;
  },
}));

describe("OfflinePage", () => {
  it("exibe a mensagem de sem conexão", async () => {
    render(await OfflinePage());
    expect(screen.getByRole("heading", { name: /sem conexão/i })).toBeInTheDocument();
    expect(screen.getByText(/offline/i)).toBeInTheDocument();
  });
});
