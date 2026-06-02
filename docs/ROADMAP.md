# ROADMAP — Cronograma e Marcos

Cronograma realista para um desenvolvedor solo nível iniciante/intermediário, dedicação parcial (15-25h/semana), do início do projeto ao lançamento público com primeiras assinaturas pagas. Ajuste para mais ou menos tempo proporcionalmente à dedicação.

## Visão geral

```
Mês 0 (Setup)      ──► Mês 1 (Core)      ──► Mês 2 (Vitrine + UX)
                                                       │
                                                       ▼
Mês 5+ (Crescimento) ◄── Mês 4 (Lançamento) ◄── Mês 3 (Pagamento + Polimento)
```

| Fase                     | Duração       | Resultado                                  |
| ------------------------ | ------------- | ------------------------------------------ |
| 0. Setup                 | Semana 0      | Ambiente, contas, repositório, base do app |
| 1. Core                  | Semanas 1-4   | Auth, CRUD de produtos, painel funcional   |
| 2. Vitrine + UX          | Semanas 5-8   | Vitrine pública, intent de pedido, PWA     |
| 3. Pagamento + Polimento | Semanas 9-12  | Asaas, planos, polish                      |
| 4. Lançamento            | Semanas 13-14 | Beta com embaixadoras, ajustes finais      |
| 5. Crescimento           | Semana 15+    | Aquisição, iterações com base em feedback  |

## Fase 0 — Setup (Semana 0)

### Objetivos

Preparar todo o ferramental e a base do projeto para começar a desenvolver sem fricção.

### Entregáveis

- [ ] Repositório GitHub criado, com branch protection no `main`
- [x] Projeto Next.js 14 inicial com TypeScript, Tailwind, shadcn/ui configurados
- [ ] Projeto Supabase criado na região São Paulo
- [ ] Conta Vercel conectada ao repo, deploy automático funcionando
- [ ] Conta Asaas criada (sandbox)
- [ ] Conta Resend criada (e-mail transacional)
- [ ] Domínio adquirido e DNS apontando
- [x] Variáveis de ambiente documentadas em `.env.example`
- [x] CI básico no GitHub Actions (typecheck + lint)
- [x] Pasta `docs/` com toda esta documentação versionada
- [x] ESLint + Prettier + Husky configurados

### Definição de pronto

`pnpm dev` roda localmente, deploy de "hello world" passa para o domínio em staging.

## Fase 1 — Core (Semanas 1 a 4)

### Objetivos

Construir o fluxo essencial: cadastro, login, criação de vitrine inicial, CRUD completo de produtos. Sem ainda ter a vitrine pública renderizada nem PWA.

### Semana 1 — Autenticação e estrutura

- [x] Schema inicial do banco (migration `initial_schema.sql`) — #0003
- [x] Triggers de `handle_new_user`, `set_updated_at` — #0003
- [x] RLS para `profiles`, `vitrines`, `subscriptions` — #0004
- [x] Páginas de login, cadastro, recuperar senha — #0005
- [x] Login com Google (OAuth) — #0006
- [x] Layout do dashboard com bottom nav mobile — #0007

### Semana 2 — Onboarding e perfil

- [x] Fluxo de onboarding (4 passos) — #0008
- [x] Validação de slug em tempo real — #0008
- [x] Validação de WhatsApp (formato + envio de SMS opcional adiado) — #0008
- [ ] Tela de perfil com edição de nome, foto, bio — #0009
- [ ] Upload de avatar com compressão no cliente — #0009

### Semana 3 — CRUD de produtos (parte 1)

- [x] Migration de `products`, `product_images`, `categories`, `brands` _(#0003)_
- [x] RLS de products e relacionados _(#0004)_
- [x] Tela de listagem de produtos (vazia + com produtos) _(#0010)_
- [x] Form de criação de produto com validação Zod _(#0010)_
- [x] Upload de imagem de produto (com compressão e crop) _(#0010)_
- [x] Trigger de limite por plano _(#0003)_

### Semana 4 — CRUD de produtos (parte 2)

- [ ] Edição e exclusão de produto
- [ ] Múltiplas imagens (até 5)
- [ ] Categorias customizáveis
- [ ] Marcas com autocomplete e sugestões
- [ ] Marcação de "esgotado" e preço promocional
- [ ] Reordenação manual (drag-and-drop)

### Marco fim da Fase 1

Uma usuária consegue se cadastrar, completar o onboarding, e cadastrar 5 produtos com fotos. Tudo persiste no banco. Vitrine pública ainda não acessível.

## Fase 2 — Vitrine + UX (Semanas 5 a 8)

### Objetivos

Tornar a vitrine pública acessível, registrar intenções de pedido, implementar PWA, polir o painel.

### Semana 5 — Vitrine pública

- [ ] Rota `/[slug]` com Server Component
- [ ] Header com foto, nome, bio, contato
- [ ] Grid responsivo de produtos
- [ ] Modal de detalhe do produto (carrossel de fotos, descrição)
- [ ] Botão "Pedir no WhatsApp" com mensagem pré-formatada
- [ ] ISR com revalidate de 60s
- [ ] Tema claro/escuro automático

### Semana 6 — Filtros e busca

- [ ] Filtro por categoria na vitrine
- [ ] Filtro por marca
- [ ] Busca por texto (full-text search Postgres)
- [ ] Compartilhamento via Web Share API
- [ ] Empty states bonitos

### Semana 7 — Intent de pedido + Estatísticas

- [ ] Endpoint `/api/intent` com rate limit
- [ ] Registro de hash de IP, user agent resumido, source
- [ ] Tela "Pedidos" no painel: feed de intents, agrupamento por dia
- [ ] Tela "Estatísticas": views totais, cliques, top produtos
- [ ] Gráfico simples de últimos 7 e 30 dias

### Semana 8 — PWA + Performance

- [ ] Manifest.json configurado, ícones gerados
- [ ] Service worker com next-pwa ou Serwist
- [ ] Cache offline da vitrine pública (somente leitura)
- [ ] Compressão de imagem otimizada
- [ ] Auditoria Lighthouse: alvo 90+ em mobile
- [ ] Sentry configurado

### Marco fim da Fase 2

Uma usuária pode compartilhar `vitrinio.com.br/maria-silva` com clientes, eles abrem no celular, navegam, clicam em "Pedir no WhatsApp" e a conversa abre com mensagem pronta. A usuária vê os pedidos no painel e pode instalar o app no celular.

## Fase 3 — Pagamento + Polimento (Semanas 9 a 12)

### Objetivos

Permitir cobrança real, lidar com upgrades, refinar tudo o que já está pronto.

### Semana 9 — Integração Asaas

- [ ] SDK Asaas (cliente HTTP simples)
- [ ] Criação de cliente Asaas no primeiro upgrade
- [ ] Criação de assinatura Pro (R$ 39/mês) e Plus (R$ 69/mês)
- [ ] Página de checkout (PIX QR Code, cartão, boleto)
- [ ] Webhook em `/api/webhooks/asaas` com validação HMAC
- [ ] Tabela `invoices` populada via webhook

### Semana 10 — Gestão de plano

- [ ] Tela "Meu plano" com upgrade, downgrade, cancelamento
- [ ] Histórico de faturas com download de PDF
- [ ] Comportamento ao expirar (downgrade para Free, sem perda de dados)
- [ ] Aviso quando atinge limite do Free com CTA para upgrade
- [ ] Cupons promocionais (PRIMEIRA50)
- [ ] Pagamento anual com 20% de desconto

### Semana 11 — Suporte e conteúdo

- [ ] FAQ com busca (mínimo 20 perguntas)
- [ ] 5 vídeos tutoriais curtos (60-90s cada)
- [ ] Tour guiado no primeiro acesso
- [ ] Página de termos de uso
- [ ] Política de privacidade
- [ ] Página de exclusão de conta (LGPD)

### Semana 12 — Polimento geral

- [ ] Revisão de todas as cópias (tom de voz)
- [ ] Acessibilidade: contraste, foco, aria-labels
- [ ] Otimização de imagens da landing
- [ ] Testes E2E críticos com Playwright
- [ ] Backup automático configurado e testado
- [ ] Health check e alertas

### Marco fim da Fase 3

Sistema funcional ponta a ponta. Uma usuária pode subir do Free para o Pro, pagar via PIX, voltar e ver o limite removido. Webhook funcionando, fatura emitida, e-mail de confirmação enviado. Documentação de suporte publicada.

## Fase 4 — Lançamento (Semanas 13 a 14)

### Semana 13 — Beta fechado

- [ ] Recrutar 10 embaixadoras (revendedoras reais via Instagram, indicação, grupos)
- [ ] Criar plano "embaixadora" interno (gratuito vitalício do Plus)
- [ ] Onboarding 1:1 via WhatsApp ou call
- [ ] Coletar feedback estruturado a cada 3 dias
- [ ] Fix de bugs e ajustes urgentes
- [ ] Pelo menos 5 usuárias com 10+ produtos e vitrine compartilhada com clientes

### Semana 14 — Ajustes e go-live

- [ ] Implementar top 5 melhorias do feedback do beta
- [ ] Stress test do servidor (k6 ou similar)
- [ ] Configurar analytics de conversão
- [ ] Preparar conteúdo de lançamento (posts Instagram, vídeo TikTok)
- [ ] Lançar publicamente com cupom de primeira mensalidade

### Marco fim da Fase 4

Aplicação em produção, aceitando cadastros públicos, com pelo menos as 10 embaixadoras como base inicial e primeiras 5-10 assinaturas pagas convertidas.

## Fase 5 — Crescimento (Semana 15 em diante)

A partir daqui o roadmap deixa de ser linear e passa a ser orientado por dados e feedback. Ver [GTM.md](./GTM.md) para estratégia de aquisição em fases. Algumas iniciativas previstas:

### Curto prazo (mês 4-5)

- [ ] Programa de indicação ("traga uma amiga")
- [ ] Importação em lote de produtos via CSV
- [ ] Personalização de cores da vitrine (Pro+)
- [ ] Origem do tráfego nas estatísticas

### Médio prazo (mês 6-8)

- [ ] Vídeos nos produtos (Plus)
- [ ] Múltiplas vitrines (Plus)
- [ ] Domínio próprio (Plus)
- [ ] Notificações push web
- [ ] App nativo iOS/Android (decisão pós-PMF)

### Longo prazo (mês 9+)

- [ ] Variantes de produto (cor, tamanho)
- [ ] Marketplace ou descoberta entre vitrines (decisão estratégica)
- [ ] Integração API com gateways das marcas
- [ ] Expansão para Argentina e México

## Riscos do cronograma

| Risco                                               | Probabilidade | Plano B                                                                           |
| --------------------------------------------------- | ------------- | --------------------------------------------------------------------------------- |
| Disponibilidade real abaixo de 15h/semana           | Alta          | Estender cada fase em 1 semana, não cortar escopo                                 |
| Complexidade do PWA maior que esperada              | Média         | Lançar como web puro, PWA vira melhoria pós-lançamento                            |
| Webhook Asaas com bugs                              | Baixa         | Sandbox extensivo, fallback manual em primeiras assinaturas                       |
| Beta com feedback que exige refazer fluxo principal | Média         | Já reservar semana 14 para ajustes; se necessário, atrasar lançamento 1-2 semanas |
| Bugs em produção bloqueantes                        | Média         | Disponibilidade alta nas 4 primeiras semanas pós-lançamento                       |

## Princípios para gerir o cronograma

1. **Funcional antes de bonito.** Cada feature primeiro funciona com UI mínima, depois é polida.
2. **Mergear pequeno e cedo.** PRs grandes (>500 linhas) são proibidos.
3. **Testes E2E só nos fluxos críticos.** Cobertura 100% é desperdício no MVP. Foco: cadastro, criação de produto, vitrine pública carrega, webhook de pagamento.
4. **Documentação atualizada junto com o código.** Mudou um campo do schema? Atualiza DATABASE.md no mesmo PR.
5. **Velocidade > perfeição arquitetural.** Decisões duvidosas viram TODO comentado, não viram travas. Refator quando dor real aparecer.
