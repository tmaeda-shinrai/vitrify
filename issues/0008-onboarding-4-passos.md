# [0008] Onboarding em 4 passos

|                |                                                  |
| -------------- | ------------------------------------------------ |
| **Milestone**  | M1 — Conta e autenticação                        |
| **Roadmap**    | Fase 1, Semana 2                                 |
| **Prioridade** | Must                                             |
| **Planos**     | Todos                                            |
| **Depende de** | #0005/#0006, #0007                               |
| **Bloqueia**   | #0010 (precisa de vitrine ativa com slug), #0012 |

## Contexto

Primeiro acesso após o cadastro: 4 passos curtos, puláveis quando faz sentido, que ativam a vitrine e levam direto a "cadastre seu primeiro produto" — sem dashboard vazio assustando (`docs/DESIGN.md` §4.1, §1.2). É também onde a vitrine criada inativa pelo trigger ganha slug definitivo e vira ativa.

## Escopo

- Fluxo de 4 passos (`docs/DESIGN.md` §4.1):
  1. **Seu nome** — usado na vitrine ("Vitrine de Maria"); grava `profiles.full_name`.
  2. **Seu @** — slug da URL: validação em **tempo real** de formato (`^[a-z0-9][a-z0-9-]{2,39}$`) e disponibilidade (`vitrines.slug` único), com sugestões automáticas a partir do nome; bloqueio contra **blacklist** de slugs reservados (`admin`, `api`, `dashboard`, `login`, `cadastro`, etc. — `docs/ARCHITECTURE.md` §6.5, `docs/DATABASE.md` §2.2).
  3. **Seu WhatsApp** — formato E.164 sem `+` (ex.: `5567999999999`); validação de DDD + 9 dígitos. Verificação por SMS é **opcional/adiada** no MVP (`docs/ROADMAP.md` Fase 1 Sem. 2) — guardar `whatsapp` e deixar `whatsapp_verified_at` nulo.
  4. **Foto de perfil** — opcional, com botão "pular se não tiver agora"; se vier do Google, pré-preenchida; upload com compressão no cliente (ver #0009 para o componente).
- Ao concluir (ou pular o que é pulável): grava `onboarding_completed_at`, define `vitrines.slug`/`title`, marca `vitrines.is_active = TRUE`, e redireciona para a tela "Cadastre seu primeiro produto" com CTA grande central.
- Possibilidade de retomar onboarding incompleto de onde parou.
- Boas práticas de uso aceitável apresentadas brevemente (não posar como funcionária da marca, etc. — `docs/LEGAL.md` §2.2 camada 4) — pode ser um passo informativo leve ou banner.

### Fora de escopo (vai em outra issue)

- Edição posterior de perfil e troca de slug → #0009
- Verificação real de WhatsApp por SMS → backlog
- Cadastro do primeiro produto em si → #0010

## Tarefas

- [ ] Wizard de 4 passos (componente com barra de progresso), puláveis onde aplicável
- [ ] Passo nome → `profiles.full_name`
- [ ] Passo slug: validação de formato + disponibilidade em tempo real (debounce), sugestões a partir do nome, blacklist de reservados
- [ ] Passo WhatsApp: máscara/validação DDD+9 dígitos, normalização E.164 sem `+`
- [ ] Passo foto: upload com compressão (reusar `ImageUploader` de #0009) ou pular; pré-popular do Google
- [ ] Conclusão: `onboarding_completed_at`, `vitrines` (slug/title/`is_active = TRUE`), redireciona p/ "primeiro produto"
- [ ] Retomar onboarding incompleto
- [ ] Banner/passo leve de boas práticas de uso (LEGAL §2.2)
- [ ] `lib/validators/onboarding.ts` (Zod) + blacklist de slugs em `lib/utils`
- [ ] Testes: fluxo completo; slug indisponível; slug reservado; WhatsApp inválido

## Critérios de aceitação

- [ ] Uma usuária recém-cadastrada percorre os 4 passos em poucos minutos, no celular, sem tutorial
- [ ] Slug inválido/reservado/ocupado é bloqueado em tempo real com mensagem clara e sugestões
- [ ] Ao concluir, a vitrine fica ativa e acessível em `/<slug>` (mesmo que vazia, ver #0012)
- [ ] Quem pula a foto chega normalmente à tela de primeiro produto
- [ ] Critérios genéricos de aceitação (ver `issues/README.md`)

## Referências

- `docs/DESIGN.md` §1.1–1.3 (princípios), §4.1 (onboarding), §3 (EmptyState)
- `docs/ARCHITECTURE.md` §6.5 (blacklist de slug)
- `docs/DATABASE.md` §2.1 (`profiles`), §2.2 (`vitrines`, formato de slug), §3.1
- `docs/LEGAL.md` §2.2 (uso aceitável), §1.3 (dados coletados no onboarding)
- `docs/GTM.md` §5 (funil: onboarding completo)
- `docs/ROADMAP.md` Fase 1, Semana 2
