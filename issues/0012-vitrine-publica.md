# [0012] Vitrine pública `/[slug]` (ISR, header, grid, modal, SEO)

|                |                                                                                    |
| -------------- | ---------------------------------------------------------------------------------- |
| **Milestone**  | M2 — Produtos e vitrine                                                            |
| **Roadmap**    | Fase 2, Semana 5                                                                   |
| **Prioridade** | Must                                                                               |
| **Planos**     | Todos                                                                              |
| **Depende de** | #0004 (RLS de leitura pública), #0008 (slug/vitrine ativa), #0010/#0011 (produtos) |
| **Bloqueia**   | #0013, #0014, #0015                                                                |

## Contexto

A página que o cliente final abre quando recebe o link: `app/(public)/[slug]/page.tsx`. Renderizada como **Server Component com ISR (`revalidate` 60s)**, rápida como página estática, atualizada quando o produto muda (`docs/ARCHITECTURE.md` §2.1, §5.4). Tempo-alvo do cliente: ~15s da abertura do link ao WhatsApp aberto (`docs/DESIGN.md` §5.2).

## Escopo

- Rota `app/(public)/[slug]/page.tsx` (Server Component), com `generateStaticParams` opcional e `revalidate = 60`. Slug inexistente/vitrine inativa → 404 amigável.
- Leitura do Supabase com `SELECT` enxuto (só campos necessários), respeitando RLS pública (vitrine ativa, produtos ativos).
- **Header da vitrine** (`VitrineHeader`): `hero_image_url`, `title`/`full_name`, `subtitle`/`bio` (sanitizada), contato. Hero com `priority` (LCP).
- **Grid responsivo de produtos**: 2 colunas no mobile, 3–4 no desktop; `ProductCard` com foto (1:1), nome, preço (promo riscado quando houver), badge "esgotado". Lazy loading nas imagens não-LCP.
- **Modal de detalhe do produto** (`Dialog`): carrossel das fotos, descrição, preço; botão "Pedir no WhatsApp" (a lógica do botão é #0013, aqui só o lugar dele) — hidratação adiciona a interatividade.
- **Tema claro/escuro automático** respeitando `prefers-color-scheme` e `vitrines.theme_mode`; cor primária a partir de `vitrines.theme_primary` (picker livre é Pro+, futuro — no MVP basta o default e o que já existe no schema).
- **Suporte a `prefers-reduced-motion`** desabilitando animações (`docs/DESIGN.md` §6).
- **SEO / social** (`docs/GTM.md` §3.2): `<title>` dinâmico "Vitrine de {Nome} — {Marcas}"; meta description = início da bio + marcas; **Open Graph** (foto + título + descrição) para preview bonito no WhatsApp; **Schema.org** `Person` + `Product`; `sitemap.xml` com vitrines ativas; `robots.txt` permitindo vitrines e bloqueando rotas internas.
- Quando a dona edita produto/perfil, `revalidatePath('/<slug>')` (já disparado em #0009/#0011).
- Aba "Vitrine" do painel mostra um preview desta página (`docs/DESIGN.md` §4.2).
- Botão "Denunciar" presente no rodapé da vitrine (a lógica/admin é #0023; aqui o ponto de entrada).

### Fora de escopo (vai em outra issue)

- Botão "Pedir no WhatsApp" e WhatsApp flutuante (comportamento) → #0013
- Filtros, busca, Web Share → #0014
- Registro de `order_intents` e contagem de views → #0015
- Cache offline (PWA) → #0017
- Personalização livre de cores (Pro+) → backlog

## Tarefas

> Entregue em 2 PRs. **PR1 — núcleo** (esta entrega): rota/ISR, header, grid, 404,
> tema, rodapé. **PR2 — modal + SEO**: modal/carrossel, OG/Schema.org, sitemap/robots.
> Decisões: perfil da dona lido via **service role** (`profiles` sem RLS pública);
> clients **sem cookies** (`lib/supabase/public` e `admin`) para preservar o ISR; a
> aba "Vitrine" do painel mantém o link que abre `/<slug>` em nova aba.

- [x] `app/(public)/[slug]/page.tsx` Server Component, `revalidate = 60`, 404 para slug inválido/inativo (com `generateStaticParams` → rota `●` SSG/ISR)
- [x] Query enxuta (campos necessários) respeitando RLS pública (`lib/vitrine-data.ts`)
- [x] `VitrineHeader` (hero `priority`, nome, bio, contato)
- [x] Grid responsivo (2/3–4 colunas) com `ProductCard` (foto 1:1, preço, promo, "esgotado")
- [x] Modal de detalhe (`Dialog`) com carrossel de fotos (scroll-snap) + descrição + preço + CTA WhatsApp (link `wa.me` básico; lógica completa em #0013)
- [x] Tema claro/escuro automático + `theme_primary`/`theme_mode`; `prefers-reduced-motion` (global)
- [x] `<title>` dinâmico, meta description, Open Graph, Schema.org `Person`/`Product` (`generateMetadata` + `VitrineJsonLd`)
- [x] `sitemap.xml` (vitrines ativas) e `robots.txt`
- [x] Preview da vitrine na aba "Vitrine" do painel (link em nova aba já existente)
- [x] Link "Denunciar" no rodapé (entrada para #0023)
- [x] Testes: helpers (`hexToHsl`, vitrine, `buildVitrineMetadata`/`buildVitrineJsonLd`) + componentes (header, grid, carrossel, modal)

## Critérios de aceitação

- [ ] `/<slug>` carrega rápido (cache hit servido do edge); cache miss regenera e serve
- [ ] Cliente vê header + grid; tocar num produto abre o modal com fotos e descrição
- [ ] Preview no WhatsApp mostra foto + título + descrição (Open Graph)
- [ ] Editar um produto reflete na vitrine em ≤ ~60s (ou imediato via revalidate)
- [ ] Vitrine inativa ou slug inexistente → página 404 amigável
- [ ] Atende metas de performance de `docs/ARCHITECTURE.md` §7.1 para a vitrine pública (LCP < 2.0s, CLS < 0.05)
- [ ] Critérios genéricos de aceitação (ver `issues/README.md`)

## Referências

- `docs/SPEC.md` §2 (solução), §5 (métricas técnicas)
- `docs/FEATURES.md` §2 (vitrine pública)
- `docs/ARCHITECTURE.md` §2.1 (App Router/ISR), §5.4 (renderização da vitrine), §7 (performance)
- `docs/DESIGN.md` §2 (identidade), §3 (`VitrineHeader`, `ProductCard`), §5.2 (fluxo do cliente), §6 (acessibilidade)
- `docs/DATABASE.md` §2.2 (`vitrines`), §2.5–2.6 (`products`/`product_images`), §4.2–4.3 (RLS pública)
- `docs/GTM.md` §3.2 (SEO da vitrine pública)
- `docs/LEGAL.md` §2.2 (botão denunciar)
- `docs/ROADMAP.md` Fase 2, Semana 5
