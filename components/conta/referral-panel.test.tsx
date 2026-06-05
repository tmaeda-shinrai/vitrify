import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReferralPanel } from "@/components/conta/referral-panel";

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("ReferralPanel", () => {
  it("mostra o link e os contadores", () => {
    render(
      <ReferralPanel
        link="https://vitrinio.com.br?ref=K7F2QX"
        summary={{ pending: 3, converted: 2, rewarded: 1 }}
        items={[]}
      />,
    );
    expect(screen.getByText("https://vitrinio.com.br?ref=K7F2QX")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("mostra empty state quando não há indicações", () => {
    render(
      <ReferralPanel
        link="https://x?ref=A1B2"
        summary={{ pending: 0, converted: 0, rewarded: 0 }}
        items={[]}
      />,
    );
    expect(screen.getByText("emptyTitle")).toBeInTheDocument();
  });

  it("lista indicações com badge de status e sem empty state", () => {
    render(
      <ReferralPanel
        link="https://x?ref=A1B2"
        summary={{ pending: 1, converted: 1, rewarded: 1 }}
        items={[
          { id: "1", createdAt: "2026-06-01", status: "rewarded" },
          { id: "2", createdAt: "2026-06-02", status: "pending" },
        ]}
      />,
    );
    expect(screen.getByText("status.rewarded")).toBeInTheDocument();
    expect(screen.getByText("status.pending")).toBeInTheDocument();
    expect(screen.queryByText("emptyTitle")).not.toBeInTheDocument();
  });
});
