# [0011] CRUD de produtos — parte 2 (imagens, categorias, marcas, promo)

|                |                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Milestone**  | M2 — Produtos e vitrine                                                                                           |
| **Roadmap**    | Fase 1, Semana 4                                                                                                  |
| **Prioridade** | Must (edição/exclusão, múltiplas imagens, categorias, marcas, esgotado, promo) · Should (drag-and-drop, duplicar) |
| **Planos**     | Todos                                                                                                             |
| **Depende de** | #0010                                                                                                             |
| **Bloqueia**   | #0014 (filtros usam categorias/marcas)                                                                            |

## Contexto

Completa o CRUD de produtos com os recursos restantes do MVP listados em `docs/FEATURES.md` §3.

## Escopo

- **Edição e exclusão** de produto (exclusão com confirmação modal — `docs/DESIGN.md` §4.4).
- **Múltiplas imagens por produto (até 5)**: gerenciar ordem (`product_images.display_order`), definir capa, remover; limite de 5 validado na aplicação; carrossel virá na vitrine (#0012).
- **Categorias customizáveis** por vitrine (`categories`): criar/renomear/excluir, atribuir a produto; ordem de exibição; nome único por vitrine.
- **Marca como atributo** (`brands`): autocomplete com sugestões da tabela `suggested_brands` + entrada livre; criar marca nova ao digitar; única por vitrine.
- **Marcação de "esgotado"** (`products.is_available = FALSE`): produto continua visível na vitrine, mas botão de pedido desabilitado.
- **Preço promocional** (`promo_price_cents < price_cents`): preço antigo riscado + novo destacado na vitrine; badge promocional (`docs/DESIGN.md` §2.1 cor `brand-secondary`/`brand-accent`).
- **Ordenação manual (drag-and-drop)** dos produtos (`products.display_order`) — `Should`.
- **Duplicar produto** (acelera variações) — `Should`.
- Tudo dispara `revalidatePath('/<slug>')` para refletir na vitrine pública.

### Fora de escopo (vai em outra issue)

- Filtros/busca na vitrine usando categorias e marcas → #0014
- Vídeo no produto (Plus), variantes (cor/tamanho), importação CSV → backlog
- Exibição/carrossel na vitrine → #0012

## Tarefas

- [x] Editar produto (reusa `ProductForm`); excluir com confirmação modal _(PR 1)_
- [ ] Gerenciador de imagens: até 5, reordenar, definir capa, remover; validação de limite _(PR 3)_
- [x] CRUD de categorias por vitrine + atribuição a produtos + reordenação _(PR 2)_
- [x] Campo de marca com autocomplete (`suggested_brands` + livres) + criação ao salvar _(PR 2)_
- [x] Toggle "esgotado" (`is_available`) _(PR 1)_
- [x] Campo de preço promocional com validação `promo < preço` _(PR 1)_
- [ ] Drag-and-drop de produtos (persistindo `display_order`) _(PR 4)_
- [ ] Ação "duplicar produto" _(PR 4)_
- [x] `revalidatePath` em todas as mutações que afetam a vitrine _(criar/editar/excluir; mantido nos próximos PRs)_
- [ ] Testes: editar/excluir; 6ª imagem bloqueada; promo ≥ preço (erro); reordenar persiste; duplicar copia campos _(editar/excluir + promo ≥ preço feitos no PR 1)_

## Critérios de aceitação

- [x] É possível editar e excluir produtos (com confirmação) _(PR 1)_
- [ ] Um produto pode ter até 5 fotos, com capa e ordem definidas; a 6ª é bloqueada
- [x] Categorias e marcas são criadas livremente, reaproveitadas entre produtos e sem duplicar por nome _(PR 2)_
- [ ] Produto "esgotado" aparece na vitrine com botão de pedido desabilitado
- [ ] Preço promocional aparece riscado/destacado; valor inválido é bloqueado
- [ ] Reordenar e duplicar funcionam e refletem na vitrine
- [ ] Critérios genéricos de aceitação (ver `issues/README.md`)

## Referências

- `docs/FEATURES.md` §3 (gestão de produtos — todas as linhas Must/Should)
- `docs/DESIGN.md` §2.1 (cores de promo), §3 (componentes), §4.4 (confirmação destrutiva)
- `docs/DATABASE.md` §2.3 (`categories`), §2.4 (`brands`/`suggested_brands`), §2.5 (`products`), §2.6 (`product_images`)
- `docs/ARCHITECTURE.md` §5.4 (revalidação da vitrine)
- `docs/ROADMAP.md` Fase 1, Semana 4
