# [0007] Shell do dashboard e navegação mobile

|                |                                          |
| -------------- | ---------------------------------------- |
| **Milestone**  | M1 — Conta e autenticação                |
| **Roadmap**    | Fase 1, Semana 1                         |
| **Prioridade** | Must                                     |
| **Planos**     | Todos                                    |
| **Depende de** | #0005                                    |
| **Bloqueia**   | #0008, #0009, #0010, #0015, #0016, #0019 |

## Contexto

Estrutura do painel da vendedora (`app/(dashboard)/`): layout, navegação inferior mobile, guarda de rotas autenticadas e o "esqueleto" onde as telas de produtos, pedidos, estatísticas e conta vão morar. Mobile-first sem desculpas (`docs/DESIGN.md` §1.1, §4.2).

## Escopo

- Layout `app/(dashboard)/layout.tsx` com guarda de autenticação (redireciona para `/login` se sem sessão; para o onboarding se `onboarding_completed_at` for nulo).
- **Bottom navigation mobile** com 4 itens (`docs/DESIGN.md` §4.2): **Vitrine** (preview da vitrine pública), **Produtos**, **Pedidos**, **Conta**. Áreas de toque ≥ 44px, item ativo destacado.
- Layout desktop: a partir do mesmo shell, aproveitar espaço extra (sidebar ou top nav) — sem reescrever, é evolução do mobile.
- Rotas-placeholder: `produtos`, `pedidos`, `estatisticas`, `conta` (telas vazias com `EmptyState`, preenchidas em issues seguintes).
- Componente `MobileBottomNav` e `StatCard`/`EmptyState` base (lista em `docs/DESIGN.md` §3).
- Hook `useCurrentUser()` (TanStack Query) expondo profile + subscription + vitrine padrão.
- Prefetch das rotas linkadas no painel (`docs/ARCHITECTURE.md` §7.2).
- Server Components por padrão; `"use client"` só no necessário (nav interativa, etc.).

### Fora de escopo (vai em outra issue)

- Conteúdo de cada tela → #0008 (onboarding), #0009 (conta), #0010/#0011 (produtos), #0015 (pedidos), #0016 (estatísticas)
- Tour guiado de primeiro acesso → #0022

## Tarefas

- [ ] `app/(dashboard)/layout.tsx` com guarda de auth + redirecionamento para onboarding incompleto
- [ ] `MobileBottomNav` (4 itens, ativo destacado, ≥44px)
- [ ] Layout desktop (sidebar/top nav) reaproveitando o shell
- [ ] Rotas-placeholder `produtos`, `pedidos`, `estatisticas`, `conta` com `EmptyState`
- [ ] `useCurrentUser()` (profile + subscription + vitrine)
- [ ] Componentes base `EmptyState`, `StatCard`
- [ ] Prefetch das rotas do painel
- [ ] Testes: redirecionos da guarda; render do shell

## Critérios de aceitação

- [ ] Acessar `/produtos` sem login redireciona para `/login`
- [ ] Usuária autenticada sem onboarding completo é levada ao onboarding antes do painel
- [ ] Bottom nav funciona no mobile, troca de aba sem recarregar, item ativo visível
- [ ] Layout não quebra entre 360px e desktop
- [ ] Critérios genéricos de aceitação (ver `issues/README.md`)

## Referências

- `docs/DESIGN.md` §1 (princípios), §3 (componentes), §4.2 (navegação)
- `docs/ARCHITECTURE.md` §4 (rotas `(dashboard)`), §7 (performance)
- `docs/CONTRIBUTING.md` §2.5 (Server vs Client Components)
- `docs/DATABASE.md` §2.1 (`onboarding_completed_at`)
- `docs/ROADMAP.md` Fase 1, Semana 1
