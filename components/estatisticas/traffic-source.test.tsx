import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TrafficSource } from "@/components/estatisticas/traffic-source";
import { TrafficSourceLocked } from "@/components/estatisticas/traffic-source-locked";

// i18n: devolve a própria chave (client e server) para asserções simples.
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}));

describe("TrafficSourceLocked (Free)", () => {
  it("mostra o teaser bloqueado com a CTA de upgrade", () => {
    render(<TrafficSourceLocked />);
    expect(screen.getByText("sourceLockedTitle")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "sourceUpgradeCta" })).toBeInTheDocument();
  });
});

describe("TrafficSource (Pro+)", () => {
  it("renderiza as origens com suas contagens", async () => {
    render(
      await TrafficSource({
        data: [
          { source: "instagram", count: 12 },
          { source: "direct", count: 3 },
        ],
      }),
    );
    expect(screen.getByText("source.instagram")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("source.direct")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
