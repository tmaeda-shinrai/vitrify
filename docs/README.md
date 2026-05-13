# Vitrine Digital para Revendedores Autônomos

Aplicação web (PWA) que permite a revendedores autônomos multimarcas criar uma vitrine digital unificada, compartilhável por link único, com pedidos finalizados via WhatsApp.

## Em uma frase

Um Linktree-de-produtos para a revendedora que vende Avon + Natura + Hinode + Mary Kay no mesmo cliente.

## Por que existe

O mercado brasileiro de venda direta movimenta cerca de R$ 50 bilhões/ano com aproximadamente 3 milhões de revendedores ativos. 79% deles vendem pelo WhatsApp e 71% pelas redes sociais. As ferramentas oficiais das marcas são limitadas a um único portfólio, e os concorrentes generalistas (Kyte, Vendizap) ou são complexos demais (focados em PDV) ou caros para o público-alvo. O gap está exatamente no revendedor multimarcas que precisa de uma vitrine unificada, simples e barata.

## Estado atual

MVP em fase de planejamento. Esta documentação é o ponto de partida.

## Índice da documentação

| Documento                            | Quando consultar                                                              |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| [SPEC.md](./SPEC.md)                 | Visão geral do produto, problema, solução, KPIs e métricas de sucesso         |
| [FEATURES.md](./FEATURES.md)         | Lista detalhada de funcionalidades, priorização MoSCoW e divisão por plano    |
| [DESIGN.md](./DESIGN.md)             | Identidade visual, design system, princípios de UX e fluxos de tela           |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Stack técnica, diagramas de arquitetura, decisões e trade-offs                |
| [DATABASE.md](./DATABASE.md)         | Schema do banco, relações entre tabelas, políticas RLS e migrações            |
| [ROADMAP.md](./ROADMAP.md)           | Cronograma do MVP em fases, marcos e critérios de pronto                      |
| [PRICING.md](./PRICING.md)           | Modelo de monetização, planos, gateway de pagamento e estratégia de conversão |
| [LEGAL.md](./LEGAL.md)               | LGPD, propriedade intelectual, termos de uso e itens regulatórios             |
| [GTM.md](./GTM.md)                   | Estratégia de aquisição, canais e plano de lançamento                         |

## Stack resumida

Frontend: Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui + PWA
Backend: Supabase (Postgres + Auth + Storage + Edge Functions)
Pagamentos: Asaas (preferencial pelo PIX recorrente) ou Pagar.me
Hospedagem: Vercel + Supabase região São Paulo
Analytics: Plausible ou PostHog (self-hosted opcional)

## Pré-requisitos para começar a desenvolver

1. Node.js 20+ e pnpm
2. Conta Supabase (projeto na região South America – São Paulo)
3. Conta Asaas (sandbox para desenvolvimento)
4. Conta Vercel para deploy
5. Domínio próprio (vitrinio.com.br)
