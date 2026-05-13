# [0025] Beta fechado com embaixadoras e go-live

| | |
|---|---|
| **Milestone** | M7 — Lançamento |
| **Roadmap** | Fase 4 — Lançamento (Semanas 13–14) |
| **Prioridade** | Must |
| **Planos** | Todos (embaixadoras recebem Plus vitalício) |
| **Depende de** | #0001–#0024 (produto funcional ponta a ponta) |

## Contexto

Fechar o ciclo do MVP: validar o produto com revendedoras reais, ajustar com base no feedback e lançar publicamente. Atende aos critérios de pronto "10 usuárias-piloto usaram por ≥ 2 semanas e validaram o fluxo" e "pagamento recorrente testado em produção com ≥ 5 transações reais" (`docs/SPEC.md` §8). Boa parte desta issue é operacional/marketing, não código — está aqui para fechar o backlog do MVP.

## Escopo

### Semana 13 — Beta fechado (`docs/ROADMAP.md` Fase 4, `docs/GTM.md` §2.1)
- Recrutar **10 embaixadoras** (revendedoras reais via Instagram/indicação/grupos) com critérios de engajamento real (`docs/GTM.md` §2.1: posta com regularidade, responde DMs, clientela real, idealmente 2+ marcas; validar com NotJustAnalytics/Modash).
- Criar **plano "embaixadora" interno**: Plus gratuito vitalício enquanto a parceria estiver ativa + selo "Embaixadora Pioneira" (flag gerenciável pelo admin — coordena com #0023).
- **Onboarding 1:1** via WhatsApp/call (30 min) com cada embaixadora.
- **Coletar feedback estruturado** a cada 2–3 dias; corrigir bugs e ajustes urgentes.
- Meta: ≥ 5 embaixadoras com 10+ produtos e vitrine compartilhada com clientes reais.
- **Acordo com Embaixadoras** (documento de parceria — `docs/LEGAL.md` §9 item 4): compromisso de uso por 90 dias, 2 posts (1 nos primeiros 30d, 1 entre 60–90d), feedback quinzenal, permissão de uso de foto/nome em estudos de caso (`docs/GTM.md` §2.1).

### Semana 14 — Ajustes e go-live (`docs/ROADMAP.md` Fase 4, `docs/GTM.md` §6)
- Implementar **top 5 melhorias** do feedback do beta.
- **Stress test** do servidor (k6 ou similar) — cenário de tráfego de lançamento.
- **Pagamento testado em produção**: ≥ 5 transações reais (assinaturas pagas de verdade) confirmadas via webhook, com NF-e emitida (coordena com #0018/#0024).
- **Configurar analytics de conversão** do funil (`docs/GTM.md` §5, §7) — segmentado por canal de origem.
- **Conteúdo de lançamento** (`docs/GTM.md` §6.1): landing page (`/` com hero, demo em vídeo, depoimentos, planos, FAQ); 3 vídeos curtos para Instagram/TikTok; post de lançamento (carrossel de 7 telas); e-mail para lista de espera (se houver); press release para blogs do nicho.
- Ativar o cupom **`PRIMEIRA50`** (50% off na 1ª mensalidade) — coordena com #0019.
- **Cronograma do lançamento** (semana 14, `docs/GTM.md` §6.2): Seg embaixadoras postam → Ter post oficial → Qua e-mail + cupom → Qui stories de depoimentos → Sex live com fundadora + 2 embaixadoras → fim de semana conteúdo orgânico → próx. seg análise.
- **Checklist pré-lançamento de `docs/LEGAL.md` §8** verificado (CNPJ ativo, conta PJ, contador, termos/privacidade publicados e aceitos, exclusão e export de dados funcionando, `dpo@`/`direitos@` ativos, denúncia funcionando, audit logs, backup testado, plano de incidentes, revisão jurídica feita, NF-e automática).

### Fora de escopo (vai em outra issue / fases seguintes)
- Estratégia de aquisição das Fases 2 e 3 do GTM (conteúdo orgânico contínuo, tráfego pago, microinfluencers, eventos) → `docs/GTM.md` §3–4 / `docs/ROADMAP.md` Fase 5
- Features de v1.1+ (CSV, personalização de cores, origem do tráfego rica, vídeos no produto, múltiplas vitrines, domínio próprio, push) → backlog / `docs/ROADMAP.md` Fase 5
- Constituição da empresa em si (CNPJ, contador) — pré-requisito operacional, não código

## Tarefas

- [ ] Recrutar 10 embaixadoras (critérios de engajamento validados)
- [ ] Plano "embaixadora" interno + selo "Embaixadora Pioneira" (flag no admin)
- [ ] Onboarding 1:1 com cada embaixadora
- [ ] Coleta de feedback estruturado (a cada 2–3 dias) + correções urgentes
- [ ] Documento "Acordo com Embaixadoras" (com advogado)
- [ ] Implementar top 5 melhorias do feedback
- [ ] Stress test (k6) com cenário de lançamento
- [ ] ≥ 5 transações reais de assinatura em produção, confirmadas + NF-e emitida
- [ ] Analytics de conversão do funil configurado (por canal)
- [ ] Landing page de lançamento + 3 vídeos + post carrossel + e-mail lista de espera + press release
- [ ] Ativar cupom `PRIMEIRA50`
- [ ] Executar o cronograma de lançamento da semana 14
- [ ] Verificar o checklist pré-lançamento de `LEGAL.md` §8 item a item

## Critérios de aceitação (= critérios de pronto do MVP, `docs/SPEC.md` §8)

- [ ] 10 usuárias-piloto usaram o produto por ≥ 2 semanas e validaram o fluxo (≥ 5 com 10+ produtos e vitrine compartilhada)
- [ ] Pagamento recorrente testado em produção com ≥ 5 transações reais
- [ ] Política de privacidade, termos de uso e processo de exclusão de conta publicados (de #0021)
- [ ] Lighthouse mobile da vitrine pública ≥ 90 (de #0017)
- [ ] Backup automático configurado e testado (restore em ambiente isolado) (de #0024)
- [ ] FAQ + 5 tutoriais em vídeo curtos publicados (de #0022)
- [ ] Aplicação em produção aceitando cadastros públicos; primeiras 5–10 assinaturas pagas convertidas
- [ ] Checklist pré-lançamento de `LEGAL.md` §8 totalmente verificado

## Referências

- `docs/SPEC.md` §8 (critérios de pronto do MVP)
- `docs/ROADMAP.md` Fase 4 — Lançamento (Semanas 13–14), Fase 5 (crescimento)
- `docs/GTM.md` §2 (embaixadoras e comunidades), §5 (funil), §6 (conteúdo e cronograma de lançamento), §7 (métricas)
- `docs/PRICING.md` §5.2 (cupom `PRIMEIRA50`), §7 (NF-e)
- `docs/LEGAL.md` §8 (checklist pré-lançamento), §9 (acordo com embaixadoras)
