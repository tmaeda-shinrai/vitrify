import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WhatsAppButton } from "@/components/vitrine/whatsapp-button";
import { recordOrderIntent } from "@/lib/intent";

vi.mock("@/lib/intent", () => ({ recordOrderIntent: vi.fn() }));

describe("WhatsAppButton", () => {
  it("renderiza link wa.me e dispara a intenção no clique", () => {
    render(
      <WhatsAppButton
        whatsapp="5511999998888"
        message="Olá"
        label="Pedir no WhatsApp"
        intent={{ slug: "maria", productId: "p1" }}
      />,
    );
    const link = screen.getByRole("link", { name: "Pedir no WhatsApp" });
    expect(link).toHaveAttribute("href", "https://wa.me/5511999998888?text=Ol%C3%A1");
    fireEvent.click(link);
    expect(recordOrderIntent).toHaveBeenCalledWith({
      slug: "maria",
      productId: "p1",
    });
  });

  it("fica desabilitado (sem link) quando esgotado", () => {
    render(
      <WhatsAppButton
        whatsapp="5511999998888"
        message="Olá"
        label="Pedir no WhatsApp"
        disabled
        disabledLabel="Esgotado"
      />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Esgotado" })).toBeDisabled();
  });

  it("fica desabilitado quando não há número", () => {
    render(<WhatsAppButton whatsapp={null} message="Olá" label="Pedir no WhatsApp" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
