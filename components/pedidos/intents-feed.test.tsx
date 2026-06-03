import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { IntentsFeed } from "@/components/pedidos/intents-feed";
import { groupIntentsByDay, type OrderIntentItem } from "@/lib/intents";

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));

function item(over: Partial<OrderIntentItem> = {}): OrderIntentItem {
  return {
    id: "i1",
    productName: "Perfume",
    source: "instagram",
    device: "mobile-ios",
    createdAt: "2026-06-03T10:00:00Z",
    ...over,
  };
}

describe("IntentsFeed", () => {
  it("mostra produto, dispositivo e 'Dúvida geral' sem produto; oculta origem", () => {
    const groups = groupIntentsByDay([item({ id: "a" }), item({ id: "b", productName: null })]);
    render(<IntentsFeed groups={groups} showSource={false} />);
    expect(screen.getByText("Perfume")).toBeInTheDocument();
    expect(screen.getByText("generalInquiry")).toBeInTheDocument();
    expect(screen.getAllByText("device.mobile-ios").length).toBeGreaterThan(0);
    expect(screen.queryByText("source.instagram")).not.toBeInTheDocument();
  });

  it("mostra a origem quando Pro+", () => {
    render(<IntentsFeed groups={groupIntentsByDay([item()])} showSource />);
    expect(screen.getByText("source.instagram")).toBeInTheDocument();
  });
});
