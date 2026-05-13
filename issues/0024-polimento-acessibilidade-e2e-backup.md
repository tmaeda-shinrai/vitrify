# [0024] Polimento, acessibilidade, E2E e backup

| | |
|---|---|
| **Milestone** | M6 — Conformidade e polimento |
| **Roadmap** | Fase 3, Semana 12 |
| **Prioridade** | Must |
| **Planos** | Todos |
| **Depende de** | praticamente todas as issues de feature |
| **Bloqueia** | #0025 |

## Contexto

A passada final antes do beta: revisar cópias, fechar a acessibilidade (LBI/WCAG 2.1 AA), cobrir os fluxos críticos com testes E2E, configurar e **testar** o backup automático, ligar os alertas e ativar a emissão de NF-e. Atende aos critérios de pronto "Lighthouse mobile > 90" (já em #0017), "Backup automático configurado e testado" e "funcionalidades testadas" (`docs/SPEC.md` §8).

## Escopo

- **Revisão de todas as cópias** (tom de voz: amiga organizada, sem jargão — `docs/DESIGN.md` §1.3); padronizar termos ("Sua vitrine", "Cadastre um produto", etc.); revisar `messages/pt-BR.json`.
- **Acessibilidade** (`docs/DESIGN.md` §6, `docs/LEGAL.md` §6 — LBI/WCAG 2.1 AA): contraste ≥ AA em todo texto; foco visível em tudo interativo (nunca remover outline sem substituir); `alt` obrigatório nas imagens de produto (validado no cadastro — coordena com #0010/#0011); `aria-label` em ícones-botão; estrutura semântica (headings hierárquicos, landmarks); navegação completa por teclado no painel desktop; `prefers-reduced-motion`. Rodar auditoria (axe/Lighthouse) e corrigir.
- **Otimização de imagens da landing** e demais ativos estáticos.
- **Testes E2E críticos com Playwright** (`docs/CONTRIBUTING.md` §3.2 / `docs/ROADMAP.md` Fase 3): (1) cadastro → onboarding → 1º produto; (2) criar produto com foto → ver na vitrine pública; (3) cliente clica "Pedir no WhatsApp" → intent registrada; (4) Free atinge limite → upgrade para Pro → produto extra liberado; (5) cancelar plano → mantém acesso até fim do período. Rodando no CI em preview.
- **Backup automático configurado e testado** (`docs/ARCHITECTURE.md` §10, `docs/DATABASE.md` §7): backup nativo Supabase (diário, retenção 7/30d conforme plano) + **dump semanal exportado para storage externo (Wasabi/S3) com retenção 90d**; **restore testado** em ambiente isolado (RTO 4h / RPO 24h); agendar teste de restore mensal.
- **Alertas e health check** ligados de fato (coordena com #0023): webhook Asaas falhando 3x → Slack; banco p95 > 1s → Slack; 5xx > 1% → Slack + e-mail; Storage > 80% → e-mail (`docs/ARCHITECTURE.md` §8.4).
- **NF-e automática** (`docs/PRICING.md` §7, `docs/LEGAL.md` §8): integrar NFE.io / Webmania ou módulo do Asaas; toda fatura paga gera NFS-e em ≤ 24h via webhook; reter dados fiscais 5 anos.
- **ADRs iniciais** em `docs/adr/` (`docs/ARCHITECTURE.md` §12): ADR-001 Supabase, ADR-002 Asaas, ADR-003 App Router, ADR-004 PWA, ADR-005 ISR.
- Stress test do servidor (k6 ou similar) — pode ficar para #0025 (semana 14); registrar onde será feito.

### Fora de escopo (vai em outra issue)

- Lighthouse da vitrine ≥ 90 → já em #0017 (aqui só confirmar que continua passando)
- Beta com embaixadoras, conteúdo de lançamento, transações reais de produção → #0025

## Tarefas

- [ ] Revisão de cópias e padronização de termos; `messages/pt-BR.json` revisado
- [ ] Auditoria de acessibilidade (axe/Lighthouse) + correções: contraste, foco, `alt`, `aria-label`, semântica, teclado, `prefers-reduced-motion`
- [ ] `alt` obrigatório no cadastro de imagem de produto (confirmar com #0010/#0011)
- [ ] Otimização de imagens da landing/ativos
- [ ] 5 fluxos E2E críticos com Playwright, rodando no CI
- [ ] Backup nativo Supabase + dump semanal externo (Wasabi/S3, 90d) + **restore testado** em ambiente isolado; agendar teste mensal
- [ ] Alertas (Slack/e-mail) e health check operando conforme `ARCHITECTURE.md` §8.4
- [ ] NF-e automática via webhook (NFE.io/Webmania/Asaas); retenção fiscal 5 anos
- [ ] ADRs 001–005 em `docs/adr/`
- [ ] Definir/registrar onde rodar o stress test (k6) — aqui ou #0025

## Critérios de aceitação

- [ ] Cópias consistentes e em pt-BR sem jargão; nenhuma string hard-coded fora de `messages/`
- [ ] Auditoria de acessibilidade sem violações sérias; navegação por teclado completa no painel desktop; contraste AA
- [ ] Os 5 fluxos E2E passam no CI
- [ ] Backup roda automaticamente e um **restore foi efetivamente testado** em ambiente isolado (documentado)
- [ ] Alertas críticos chegam ao canal; health check reporta status real
- [ ] Pagamento confirmado gera NFS-e em ≤ 24h
- [ ] ADRs iniciais escritos
- [ ] Critérios genéricos de aceitação (ver `issues/README.md`)

## Referências

- `docs/SPEC.md` §8 (critérios: testado, Lighthouse > 90, backup testado)
- `docs/DESIGN.md` §1.3 (tom de voz), §6 (acessibilidade), §4.5 (imagens)
- `docs/ARCHITECTURE.md` §7 (performance), §8 (observabilidade/alertas), §10 (backup/DR), §12 (ADRs)
- `docs/DATABASE.md` §7 (backup e retenção)
- `docs/CONTRIBUTING.md` §3 (testes, fluxos E2E críticos), §5 (performance)
- `docs/PRICING.md` §7 (notas fiscais), `docs/LEGAL.md` §6 (acessibilidade), §8 (NF-e)
- `docs/ROADMAP.md` Fase 3, Semana 12; Fase 4 Semana 14 (stress test)
