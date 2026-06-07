"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { FAQ_ITEMS, faqCategories, filterFaq } from "@/lib/help/faq";

/**
 * FAQ pesquisável (#0022). Busca client-side acento-insensível (`filterFaq`) sobre os
 * dados estáticos; perguntas em `<details>` agrupadas por categoria. Sem rota/estado
 * na URL — é uma página estática com filtro local.
 */
export function FaqSection() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => filterFaq(FAQ_ITEMS, query), [query]);
  const categories = useMemo(() => faqCategories(results), [results]);

  return (
    <section className="space-y-6">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar na ajuda…"
          aria-label="Buscar na ajuda"
          className="pl-9"
        />
      </div>

      {results.length === 0 ? (
        <EmptyState
          title="Nada encontrado"
          description="Tente outras palavras ou fale com a gente pelo WhatsApp."
        />
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category} className="space-y-2">
              <h2 className="font-display text-lg font-semibold">{category}</h2>
              <ul className="divide-y divide-border rounded-lg border border-border">
                {results
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <li key={item.id}>
                      <details className="group px-4 py-3">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium">
                          {item.question}
                          <ChevronDown
                            className="size-4 shrink-0 text-muted-foreground transition group-open:rotate-180"
                            aria-hidden
                          />
                        </summary>
                        <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
                      </details>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
