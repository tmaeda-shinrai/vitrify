import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { VitrineHeader } from "@/components/vitrine/vitrine-header";
import type { PublicVitrine } from "@/lib/vitrine";

const base: PublicVitrine = {
  id: "v1",
  slug: "maria",
  title: "Minha Vitrine",
  subtitle: null,
  heroImageUrl: null,
  themeMode: "auto",
  themePrimary: null,
  owner: { fullName: "Maria Silva", bio: null, avatarUrl: null, whatsapp: null },
  products: [],
};

describe("VitrineHeader", () => {
  it("usa o nome da dona quando o título ainda é o placeholder", () => {
    render(<VitrineHeader vitrine={base} />);
    expect(screen.getByRole("heading", { name: "Maria Silva" })).toBeInTheDocument();
  });

  it("mostra título personalizado, bio e WhatsApp formatado", () => {
    render(
      <VitrineHeader
        vitrine={{
          ...base,
          title: "Beleza da Maria",
          owner: { ...base.owner, bio: "Revendo Natura e Avon", whatsapp: "5511999998888" },
        }}
      />,
    );
    expect(screen.getByRole("heading", { name: "Beleza da Maria" })).toBeInTheDocument();
    expect(screen.getByText("Revendo Natura e Avon")).toBeInTheDocument();
    expect(screen.getByText("(11) 99999-8888")).toBeInTheDocument();
  });
});
