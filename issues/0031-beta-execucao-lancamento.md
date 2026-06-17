# [0031] Beta + execução do lançamento

|                |                                                |
| -------------- | ---------------------------------------------- |
| **Milestone**  | M7 — Lançamento                                |
| **Roadmap**    | Fase 4 — Lançamento (Semanas 13–14)            |
| **Prioridade** | Must                                           |
| **Planos**     | Todos (embaixadoras recebem Plus vitalício)    |
| **Depende de** | #0028 (app em produção) + #0030 (gates legais) |

## Contexto

Com o app em produção (#0028) e os gates legais fechados (#0030), esta issue executa o **beta fechado** e o
**lançamento público**: recrutar embaixadoras, coletar feedback, produzir o conteúdo de lançamento, confirmar
≥5 transações reais e rodar o cronograma da semana de go-live.

> Esta issue **absorve as tarefas operacionais/não-código da #0025**. A #0025 permanece como registro
> histórico do MVP (e do código de M7 já entregue); a execução do lançamento concentra-se aqui. Boa parte é
> marketing/operacional, não código.

## Escopo

### Beta fechado (`docs/GTM.md` §2.1)

- Recrutar **10 embaixadoras** (revendedoras reais via Instagram/indicação/grupos), com critérios de
  engajamento (posta com regularidade, responde DMs, clientela real, idealmente 2+ marcas).
- Conceder **Plus vitalício** + selo "Embaixadora Pioneira" via `setAmbassadorAction` no admin (código já
  entregue na #0025).
- **Onboarding 1:1** (30 min) com cada embaixadora; coletar feedback estruturado a cada 2–3 dias.
- **Acordo de parceria** assinado (90 dias, 2 posts, feedback quinzenal, permissão de estudo de caso).
- Implementar as **top 5 melhorias** do feedback.
- Meta: ≥ 5 embaixadoras com 10+ produtos e vitrine compartilhada com clientes reais.

### Conteúdo de lançamento (`docs/GTM.md` §6.1)

- Gravar o **vídeo intro de 60s** → setar `NEXT_PUBLIC_INTRO_VIDEO_ID`; **3 vídeos curtos** Instagram/TikTok.
- Definir o **número de suporte** → `NEXT_PUBLIC_SUPPORT_WHATSAPP`.
- Post de lançamento (carrossel de 7 telas), e-mail para lista de espera, press release para blogs do nicho.
- A landing (`/`) já está implementada (hero, vídeo demo, "como funciona", planos, FAQ) — falta só o conteúdo.

### Go-live (`docs/GTM.md` §6.2)

- Ativar o cupom **`PRIMEIRA50`** (50% off na 1ª mensalidade).
- **≥ 5 transações reais** de assinatura confirmadas via webhook, com NF-e emitida (depende de #0029).
- Confirmar o **funil no Plausible** populando (`Signup`/`Onboarding completed`/`Product created`/
  `Subscription active`) — setar `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` se ainda não.
- Executar o cronograma: Seg embaixadoras postam → Ter post oficial → Qua e-mail + cupom → Qui stories → Sex
  live → fim de semana orgânico → próx. Seg análise.

### Fora de escopo

- Aquisição das Fases 2–3 do GTM (conteúdo orgânico contínuo, tráfego pago, microinfluencers) → `docs/ROADMAP.md` Fase 5.
- Features de v1.1+.

## Tarefas

- [ ] Recrutar 10 embaixadoras (critérios validados)
- [ ] Conceder Plus vitalício + selo via admin; onboarding 1:1
- [ ] Acordo de parceria assinado
- [ ] Coleta de feedback + top 5 melhorias implementadas
- [ ] Vídeo intro (60s) + 3 vídeos curtos + número de suporte definidos
- [ ] Carrossel + e-mail lista de espera + press release
- [ ] Cupom `PRIMEIRA50` ativado
- [ ] ≥ 5 transações reais confirmadas + NF-e emitida
- [ ] Funil Plausible populando
- [ ] Cronograma da semana 14 executado

## Critérios de aceitação (= critérios de pronto do MVP, `docs/SPEC.md` §8)

- [ ] 10 usuárias-piloto usaram o produto por ≥ 2 semanas e validaram o fluxo (≥ 5 com 10+ produtos e vitrine compartilhada)
- [ ] Pagamento recorrente testado em produção com ≥ 5 transações reais
- [ ] Lighthouse mobile da vitrine pública ≥ 90 (de #0017)
- [ ] FAQ + 5 tutoriais em vídeo publicados (de #0022)
- [ ] App em produção aceitando cadastros públicos; primeiras 5–10 assinaturas pagas convertidas

## Referências

- `docs/SPEC.md` §8 (critérios de pronto), `docs/GTM.md` §2/§5/§6/§7, `docs/PRICING.md` §5.2 (`PRIMEIRA50`)
- `docs/LEGAL.md` §9 (acordo embaixadoras)
- `issues/0025-beta-fechado-e-lancamento.md` (código de M7 entregue), `lib/analytics/plausible`
