# [0010] CRUD de produtos — parte 1 (cadastro, upload, limite)

|                |                                              |
| -------------- | -------------------------------------------- |
| **Milestone**  | M2 — Produtos e vitrine                      |
| **Roadmap**    | Fase 1, Semana 3                             |
| **Prioridade** | Must                                         |
| **Planos**     | Todos (limite difere)                        |
| **Depende de** | #0003, #0004, #0008, #0009 (`ImageUploader`) |
| **Bloqueia**   | #0011, #0012, #0016                          |

## Contexto

O coração do produto: cadastrar um produto com foto, nome, preço, descrição. Inclui a listagem (vazia e populada), o formulário de criação, o upload de imagem e a aplicação do limite de plano. Tempo-alvo do fluxo: ~90 segundos do clique em "adicionar" ao produto salvo (`docs/DESIGN.md` §5.1).

## Escopo

- Tela `app/(dashboard)/produtos`: listagem em lista/grid; `EmptyState` com CTA grande quando vazia; estado com produtos (card com foto, nome, preço, status).
- Formulário de criação (Sheet/modal mobile, inline no desktop — `docs/DESIGN.md` §5.1): nome (≤120), preço (em reais na UI → armazenado em **centavos `INT`**), descrição (≤1000), foto principal. Validação com Zod compartilhada cliente/servidor (`lib/validators/product.ts`).
- Fluxo de upload (`docs/ARCHITECTURE.md` §5.1): compressão no cliente → upload direto ao Supabase Storage via signed URL → `POST /api/products` (ou Server Action) com a URL + dados → servidor valida Zod, **checa limite do plano**, insere → retorna produto → atualiza cache TanStack Query → toast → volta à lista com o novo produto no topo.
- **Limite de plano**: trigger `check_product_limit` no banco (#0003) + verificação na aplicação antes do INSERT, com erro tratado e mensagem amigável; quando atinge 5/5 no Free, abrir modal de upgrade (a tela de comparação/checkout vem em #0019, aqui basta o gancho/modal "você atingiu o limite").
- Rate limit `POST /api/products`: **30 req/min por usuário** (`docs/ARCHITECTURE.md` §6.4).
- Auto-save de rascunho do produto a cada ~5s (`docs/DESIGN.md` §4.3).
- `next/image` com loader do Supabase; tamanhos explícitos (evitar CLS).
- Componentes: `ProductCard`, `ProductForm` (`docs/DESIGN.md` §3).

### Fora de escopo (vai em outra issue)

- Edição/exclusão, múltiplas imagens, categorias, marcas, "esgotado", preço promocional, reordenação, duplicar → #0011
- Tela de comparação de planos e checkout → #0019
- Exibição na vitrine pública → #0012

## Tarefas

- [ ] Tela de listagem de produtos: vazia (`EmptyState` + CTA) e com produtos
- [ ] `lib/validators/product.ts` (Zod) — nome, preço, descrição
- [ ] `ProductForm` (Sheet mobile / inline desktop) com RHF + Zod, botão desabilitado em submit
- [ ] Upload da foto principal: compressão no cliente + signed URL + Storage (reusa `ImageUploader`)
- [ ] `POST /api/products` (ou Server Action): valida Zod, checa limite de plano, insere, retorna
- [ ] Tratamento do erro `PLAN_LIMIT_REACHED` → modal "atingiu o limite do Free" com CTA de upgrade (placeholder até #0019)
- [ ] Rate limit 30/min por usuária no endpoint de criação
- [ ] Auto-save de rascunho (~5s)
- [ ] `ProductCard` na lista; `next/image` com loader do Supabase
- [ ] Atualização otimista / invalidação do cache TanStack Query; toast de sucesso
- [ ] Testes: criar produto (caminho feliz); preço negativo (erro); 6º produto no Free (bloqueado com CTA)

## Critérios de aceitação

- [ ] Uma usuária cadastra um produto com foto em ~90s no celular
- [ ] Preço aparece formatado (`R$ 32,90`) na lista e na vitrine; persistido em centavos
- [ ] No Free, ao tentar o 6º produto, aparece o modal de limite com CTA de upgrade (sem inserir o produto)
- [ ] Imagem é comprimida no cliente antes do upload; servida via CDN/`next/image`
- [ ] Recarregar no meio do cadastro recupera o rascunho
- [ ] Critérios genéricos de aceitação (ver `issues/README.md`)

## Referências

- `docs/FEATURES.md` §3 (gestão de produtos)
- `docs/DESIGN.md` §3 (`ProductCard`, `ProductForm`, `ImageUploader`), §4.3–4.5, §5.1 (fluxo de cadastro), §2.6 (imagens dos produtos)
- `docs/ARCHITECTURE.md` §5.1 (fluxo de cadastro de produto), §6.4 (rate limiting), §7 (performance/imagens)
- `docs/DATABASE.md` §2.5 (`products`), §2.6 (`product_images`), §3.3 (`check_product_limit`)
- `docs/CONTRIBUTING.md` §2.6 (formulários), §2.7 (acesso ao banco), §5.2 (imagens)
- `docs/PRICING.md` §5.1 (gatilho de upgrade: limite de produtos)
- `docs/ROADMAP.md` Fase 1, Semana 3
