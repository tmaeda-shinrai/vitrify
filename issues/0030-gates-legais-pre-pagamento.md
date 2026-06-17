# [0030] Gates legais pré-pagamento

|                |                                                                   |
| -------------- | ----------------------------------------------------------------- |
| **Milestone**  | M7 — Lançamento                                                   |
| **Roadmap**    | Fase 4 — Lançamento (Semanas 13–14)                               |
| **Prioridade** | Must                                                              |
| **Depende de** | #0021 (conformidade legal/LGPD entregue) — paralela a #0026–#0028 |

## Contexto

Antes da **primeira cobrança real** precisamos fechar os gates operacionais e jurídicos do checklist
pré-lançamento de `docs/LEGAL.md` §8. A maior parte do **código** de conformidade já foi entregue na #0021
(exclusão de conta, export de dados, denúncia, audit logs, plano de incidentes) — aqui o trabalho é
**operacional e de verificação**: constituir a empresa, ativar caixas de e-mail de direitos, obter revisão
jurídica dos textos e **testar o restore** do backup.

Esta issue corre **em paralelo** ao go-live técnico (#0026–#0028); ela não bloqueia subir o app, mas bloqueia
aceitar pagamentos de verdade (#0031).

## Escopo

- **Empresa**: CNPJ ativo + conta bancária PJ aberta + contador contratado (pré-requisito também da NF-e #0029).
- **Caixas LGPD**: `dpo@vitrinio.com.br` e `direitos@vitrinio.com.br` ativas e **monitoradas** (a #0023 já
  notifica `direitos@` em denúncias; a caixa precisa existir de fato).
- **Revisão jurídica**: advogado de direito digital revisa os drafts de Termos/Privacidade/Cookies (hoje
  marcados "a revisar por advogado"). Se houver mudança material nos Termos, bumpar `TERMS_VERSION`
  (`lib/legal/version`) — força reaceite no `TermsGate`.
- **Teste de restore**: executar o runbook de `docs/BACKUP.md` — restaurar o dump externo em projeto isolado,
  rodar as validações (count de `profiles`/`products`, login, versão de migration), confirmar RPO < 24h e
  RTO < 4h; registrar o resultado na tabela de testes do runbook.
- **Verificação** (sem código novo) dos itens já entregues: exclusão/anonimização (30d/90d), export de dados,
  botão de denúncia → painel admin, audit logs com retenção 180d, plano de incidentes documentado.

### Fora de escopo

- Implementação dos fluxos de LGPD (já em #0021).
- NF-e (#0029) — embora compartilhe o pré-requisito CNPJ/contador.

## Tarefas

- [ ] CNPJ ativo + conta PJ + contador contratado
- [ ] Caixas `dpo@` e `direitos@vitrinio.com.br` ativas e monitoradas
- [ ] Revisão jurídica de Termos/Privacidade/Cookies concluída (e `TERMS_VERSION` bumpada se mudou material)
- [ ] Teste de restore do backup em ambiente isolado executado e registrado (RTO 4h / RPO 24h)
- [ ] Verificados: exclusão de conta, export, denúncia, audit logs, plano de incidentes

## Critérios de aceitação

- [ ] Checklist `docs/LEGAL.md` §8 totalmente marcado
- [ ] Restore validado em projeto isolado, com resultado registrado no runbook (`docs/BACKUP.md`)
- [ ] Textos legais revisados juridicamente publicados em `/termos`, `/privacidade`, `/cookies`

## Referências

- `docs/LEGAL.md` §8 (checklist pré-lançamento), §9 (acordo embaixadoras)
- `docs/BACKUP.md` (procedimento de restore + checklist de teste mensal)
- `issues/0021-conformidade-legal-lgpd.md`, `issues/0023-administracao-interna-e-moderacao.md` (denúncia → `direitos@`)
- `lib/legal/version` (`TERMS_VERSION`), `docs/security-incidents.md`
