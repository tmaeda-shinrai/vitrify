# ROADMAP — Cronograma e Marcos

Cronograma realista para um desenvolvedor solo nível iniciante/intermediário, dedicação parcial (15-25h/semana), do início do projeto ao lançamento público com primeiras assinaturas pagas. Ajuste para mais ou menos tempo proporcionalmente à dedicação.

## Visão geral

```
Mês 0 (Setup)      ──► Mês 1 (Core)      ──► Mês 2 (Vitrine + UX)
                                                       │
                                                       ▼
Mês 5+ (Crescimento) ◄── Mês 4 (Lançamento) ◄── Mês 3 (Pagamento + Polimento)
```

| Fase                     | Duração       | Resultado                                  | Status               |
| ------------------------ | ------------- | ------------------------------------------ | -------------------- |
| 0. Setup                 | Semana 0      | Ambiente, contas, repositório, base do app | ✅ concluída         |
| 1. Core                  | Semanas 1-4   | Auth, CRUD de produtos, painel funcional   | ✅ concluída         |
| 2. Vitrine + UX          | Semanas 5-8   | Vitrine pública, intent de pedido, PWA     | ✅ concluída         |
| 3. Pagamento + Polimento | Semanas 9-12  | Asaas, planos, polish                      | ✅ concluída (#0024) |
| 4. Lançamento            | Semanas 13-14 | Beta com embaixadoras, ajustes finais      | ◻ a fazer (#0025)    |
| 5. Crescimento           | Semana 15+    | Aquisição, iterações com base em feedback  | — backlog            |

## Fase 0 — Setup (Semana 0)

### Objetivos

Preparar todo o ferramental e a base do projeto para começar a desenvolver sem fricção.

### Entregáveis

- [x] Repositório GitHub criado, com branch protection no `main`
- [x] Projeto Next.js 14 inicial com TypeScript, Tailwind, shadcn/ui configurados
- [x] Projeto Supabase criado na região São Paulo
- [x] Conta Vercel conectada ao repo, deploy automático funcionando (preview por PR)
- [x] Conta Asaas criada (sandbox)
- [x] Conta Resend criada (e-mail transacional)
- [x] Domínio adquirido (`vitrinio.com.br`) — DNS final de produção fica no go-live (#0025)
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
- [x] Tela de perfil com edição de nome, foto, bio — #0009
- [x] Upload de avatar com compressão no cliente — #0009

### Semana 3 — CRUD de produtos (parte 1)

- [x] Migration de `products`, `product_images`, `categories`, `brands` _(#0003)_
- [x] RLS de products e relacionados _(#0004)_
- [x] Tela de listagem de produtos (vazia + com produtos) _(#0010)_
- [x] Form de criação de produto com validação Zod _(#0010)_
- [x] Upload de imagem de produto (com compressão e crop) _(#0010)_
- [x] Trigger de limite por plano _(#0003)_

### Semana 4 — CRUD de produtos (parte 2)

- [x] Edição e exclusão de produto _(#0011)_
- [x] Múltiplas imagens (até 5) _(#0011)_
- [x] Categorias customizáveis _(#0011)_
- [x] Marcas com autocomplete e sugestões _(#0011)_
- [x] Marcação de "esgotado" e preço promocional _(#0011)_
- [x] Reordenação manual (drag-and-drop) + duplicar _(#0011)_

### Marco fim da Fase 1

Uma usuária consegue se cadastrar, completar o onboarding, e cadastrar 5 produtos com fotos. Tudo persiste no banco. Vitrine pública ainda não acessível.

## Fase 2 — Vitrine + UX (Semanas 5 a 8)

### Objetivos

Tornar a vitrine pública acessível, registrar intenções de pedido, implementar PWA, polir o painel.

### Semana 5 — Vitrine pública

- [x] Rota `/[slug]` com Server Component — #0012
- [x] Header com foto, nome, bio, contato — #0012
- [x] Grid responsivo de produtos — #0012
- [x] Modal de detalhe do produto (carrossel de fotos, descrição) — #0012
- [x] Botão "Pedir no WhatsApp" com mensagem pré-formatada — #0013
- [x] ISR com revalidate de 60s — #0012
- [x] Tema claro/escuro automático — #0012

### Semana 6 — Filtros e busca

- [x] Filtro por categoria na vitrine — #0014
- [x] Filtro por marca — #0014
- [x] Busca por texto (client-side; full-text Postgres = otimização futura) — #0014
- [x] Compartilhamento via Web Share API — #0014 (`ShareButton`)
- [x] Empty states bonitos — #0014

### Semana 7 — Intent de pedido + Estatísticas

- [x] Endpoint `/api/intent` com rate limit
- [x] Registro de hash de IP, user agent resumido, source
- [x] Tela "Pedidos" no painel: feed de intents, agrupamento por dia
- [x] Tela "Estatísticas": views totais, cliques, top produtos
- [x] Gráfico simples de últimos 7 e 30 dias

### Semana 8 — PWA + Performance

- [x] Manifest.json configurado, ícones gerados (#0017)
- [x] Service worker com Serwist (#0017)
- [x] Cache offline da vitrine pública (somente leitura) (#0017)
- [x] Compressão de imagem otimizada (browser-image-compression no upload, #0010)
- [x] Auditoria Lighthouse: alvo 90+ em mobile (#0017 — landing 100/100; vitrine pública depende de slug semeado, confirmação final no go-live #0025)
- [x] Sentry configurado (#0017, com scrubbing de PII)

### Marco fim da Fase 2

Uma usuária pode compartilhar `vitrinio.com.br/maria-silva` com clientes, eles abrem no celular, navegam, clicam em "Pedir no WhatsApp" e a conversa abre com mensagem pronta. A usuária vê os pedidos no painel e pode instalar o app no celular.

## Fase 3 — Pagamento + Polimento (Semanas 9 a 12)

### Objetivos

Permitir cobrança real, lidar com upgrades, refinar tudo o que já está pronto.

### Semana 9 — Integração Asaas

- [x] SDK Asaas (cliente HTTP simples) — `lib/payments/` com abstração de gateway
- [x] Criação de cliente Asaas no primeiro upgrade
- [x] Criação de assinatura Pro (R$ 39/mês) e Plus (R$ 69/mês)
- [x] Página de checkout (`/assinar`) com redirect à página hospedada do Asaas (PIX/cartão/boleto)
- [x] Webhook em `/api/webhooks/asaas` com validação de token + idempotência
- [x] Tabela `invoices` populada via webhook

### Semana 10 — Gestão de plano

- [x] Tela "Meu plano" com upgrade, downgrade, cancelamento
- [x] Histórico de faturas com download de PDF
- [x] Comportamento ao expirar (downgrade para Free, sem perda de dados)
- [x] Aviso quando atinge limite do Free com CTA para upgrade
- [x] Cupons promocionais (PRIMEIRA50)
- [x] Pagamento anual com 20% de desconto

### Semana 11 — Suporte e conteúdo

- [x] FAQ com busca (mínimo 20 perguntas) — #0022 (`/ajuda`, 24 perguntas)
- [x] 5 vídeos tutoriais curtos (60-90s cada) — #0022 (estrutura/embeds prontos; gravação dos vídeos é operacional/#0025)
- [x] Tour guiado no primeiro acesso — #0022 (card de boas-vindas pós-onboarding)
- [x] Página de termos de uso — #0021 (`/termos`, draft a revisar)
- [x] Política de privacidade — #0021 (`/privacidade`, draft a revisar)
- [x] Página de exclusão de conta (LGPD) — #0009/#0021 (pedido + anonimização 30d / exclusão 90d)

### Semana 12 — Polimento geral

- [x] Revisão de cópias (tom de voz) — #0024: strings das telas públicas movidas para `messages/`
- [x] Acessibilidade: contraste AA, foco, links in-text, `alt` por foto — #0024 (auditoria axe)
- [x] Otimização de imagens da landing — #0024: auditado, nada a otimizar (sem imagens; ícones já gerados)
- [x] Testes E2E críticos com Playwright (5 fluxos) rodando no CI — #0024
- [~] Backup automático — #0024: dump semanal + runbook (`docs/BACKUP.md`); restore ao vivo é operacional (go-live)
- [x] Health check e alertas — health em #0023 (`/admin/health`); alertas por e-mail (webhook Asaas + health) em #0024 (só e-mail)
- [x] ADRs 001–005 (`docs/adr/`) — #0024
- [→] NF-e automática — movida para #0025 (lançamento)

> Semana 12 / Fase 3 concluída: a #0024 (polimento, a11y, E2E, backup, alertas, ADRs) fechou a fase, junto com #0023 (admin/moderação). Itens operacionais (teste de restore ao vivo, NF-e, stress test) seguem na #0025.

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

- [x] Programa de indicação ("traga uma amiga") — entregue no #0020 (M5, 3 PRs)
- [ ] Importação em lote de produtos via CSV
- [ ] Personalização de cores da vitrine (Pro+)
- [x] Origem do tráfego nas estatísticas (antecipado no #0016, Pro+)

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
