import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "@/components/shared/empty-state";

describe("EmptyState", () => {
  it("renderiza título e descrição", () => {
    render(<EmptyState title="Nenhum produto ainda" description="Cadastre o primeiro." />);
    expect(screen.getByRole("heading", { name: "Nenhum produto ainda" })).toBeInTheDocument();
    expect(screen.getByText("Cadastre o primeiro.")).toBeInTheDocument();
  });

  it("renderiza a ação (CTA) quando fornecida", () => {
    render(<EmptyState title="Vazio" action={<button>Adicionar</button>} />);
    expect(screen.getByRole("button", { name: "Adicionar" })).toBeInTheDocument();
  });
});
