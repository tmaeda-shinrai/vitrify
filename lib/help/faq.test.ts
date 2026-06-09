import { describe, expect, it } from "vitest";

import { FAQ_ITEMS, faqCategories, filterFaq, LANDING_FAQ_IDS, landingFaq } from "@/lib/help/faq";
import { TUTORIALS } from "@/lib/help/tutorials";

describe("FAQ", () => {
  it("tem ao menos 20 perguntas (SPEC §8)", () => {
    expect(FAQ_ITEMS.length).toBeGreaterThanOrEqual(20);
  });

  it("não tem ids duplicados", () => {
    const ids = FAQ_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("filtra acento-insensível por pergunta e resposta", () => {
    const byQuestion = filterFaq(FAQ_ITEMS, "cadastro");
    expect(byQuestion.some((i) => i.id === "cadastrar-produto")).toBe(true);

    // "promocao" sem acento casa "promoção" no conteúdo
    expect(filterFaq(FAQ_ITEMS, "promocao").length).toBeGreaterThan(0);
  });

  it("retorna tudo com busca vazia e nada quando não casa", () => {
    expect(filterFaq(FAQ_ITEMS, "").length).toBe(FAQ_ITEMS.length);
    expect(filterFaq(FAQ_ITEMS, "xyznaoexiste123").length).toBe(0);
  });

  it("faqCategories preserva a ordem de primeira aparição sem repetir", () => {
    const cats = faqCategories(FAQ_ITEMS);
    expect(cats[0]).toBe("Primeiros passos");
    expect(new Set(cats).size).toBe(cats.length);
  });

  it("landingFaq resolve todos os ids curados, na ordem", () => {
    const items = landingFaq();
    expect(items).toHaveLength(LANDING_FAQ_IDS.length);
    expect(items.map((i) => i.id)).toEqual([...LANDING_FAQ_IDS]);
  });
});

describe("Tutoriais", () => {
  it("tem ao menos 5 tutoriais (SPEC §8)", () => {
    expect(TUTORIALS.length).toBeGreaterThanOrEqual(5);
  });
});
