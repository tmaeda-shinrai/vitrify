# [0014] Filtros, busca, compartilhamento e empty states

| | |
|---|---|
| **Milestone** | M2 — Produtos e vitrine |
| **Roadmap** | Fase 2, Semana 6 |
| **Prioridade** | Must (filtros por categoria/marca) · Should (busca por texto, Web Share) |
| **Planos** | Todos |
| **Depende de** | #0011 (categorias/marcas), #0012 (vitrine pública) |

## Contexto

Tornar a vitrine navegável quando a vendedora tem muitos produtos de várias marcas — o caso de uso central do nicho multimarcas (`docs/SPEC.md` §1). Inclui filtros, busca full-text, compartilhamento da vitrine e empty states caprichados.

## Escopo

- **Filtro por categoria** na vitrine pública (categorias livres da vendedora — `docs/FEATURES.md` §2).
- **Filtro por marca** (marcas livres + sugestões).
- **Busca por texto no produto** (`Should`): usa o índice full-text Postgres (`products.search_text` GIN, config `portuguese` — #0003); indexa nome e descrição; busca tolerante a acento.
- Combinação de filtros + busca; refletir no URL (querystring) para ser compartilhável; manter performance (preferir filtrar no servidor/SQL com `LIMIT`).
- **Compartilhamento via Web Share API** (`Should`): "Compartilhar minha vitrine" no painel (e/ou na vitrine) usando `navigator.share`, com fallback para copiar link (`docs/FEATURES.md` §2 e §5).
- **Empty states** bonitos: vitrine sem produtos; categoria/busca sem resultados; ilustração + texto + CTA (`docs/DESIGN.md` §3 `EmptyState`, §2.6 placeholder amigável "Foto em breve" quando produto não tem foto).
- Manter compatível com ISR: filtros/busca client-side sobre os dados já renderizados, ou route handler leve — decidir e registrar trade-off.

### Fora de escopo (vai em outra issue)

- Origem do tráfego nas estatísticas (Pro+) → backlog / #0016 menciona como Should
- Atalhos do PWA → #0017

## Tarefas

- [ ] Filtro por categoria na vitrine (UI + query)
- [ ] Filtro por marca (UI + query)
- [ ] Busca full-text por nome/descrição (GIN, `portuguese`), tolerante a acento
- [ ] Combinação filtros+busca refletida na querystring
- [ ] "Compartilhar minha vitrine" com Web Share API + fallback copiar link + toast "copiado"
- [ ] `EmptyState` para: vitrine vazia, categoria vazia, busca sem resultado
- [ ] Placeholder "Foto em breve" para produto sem imagem
- [ ] Testes: filtrar por categoria/marca; buscar com acento; estado sem resultado; share/fallback

## Critérios de aceitação

- [ ] Cliente filtra a vitrine por categoria e por marca; resultados corretos e rápidos
- [ ] Buscar "perfume" encontra produtos com "Perfume"/"perfumes" no nome ou descrição (com/sem acento)
- [ ] URL com filtros/busca pode ser copiada e reabre no mesmo estado
- [ ] "Compartilhar minha vitrine" abre o share sheet do SO; sem suporte, copia o link
- [ ] Estados vazios mostram ilustração + texto + CTA, nunca tela em branco
- [ ] Critérios genéricos de aceitação (ver `issues/README.md`)

## Referências

- `docs/SPEC.md` §1 (problema multimarcas)
- `docs/FEATURES.md` §2 (filtros, busca, compartilhamento), §5 (Web Share)
- `docs/DESIGN.md` §2.6 (placeholder de foto), §3 (`EmptyState`)
- `docs/DATABASE.md` §2.5 (`search_text` GIN), §8 (otimizações futuras de busca)
- `docs/ARCHITECTURE.md` §5.4 (ISR), §7 (performance)
- `docs/ROADMAP.md` Fase 2, Semana 6
