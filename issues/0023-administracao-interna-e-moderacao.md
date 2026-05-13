# [0023] Administração interna e moderação

| | |
|---|---|
| **Milestone** | M6 — Conformidade e polimento |
| **Roadmap** | Fase 3, Semana 12 (e item de FEATURES §8) |
| **Prioridade** | Must |
| **Planos** | — (uso interno) |
| **Depende de** | #0004 (RLS / service role), #0012 (botão "Denunciar" na vitrine), #0021 (audit logs) |

## Contexto

Ferramentas internas não expostas ao usuário, necessárias para suporte, moderação e operação — `docs/FEATURES.md` §8. Inclui o sistema de denúncia DMCA-like exigido por `docs/LEGAL.md` §2.2 (camada 2) e §3.1, e o health check/alertas de `docs/ARCHITECTURE.md` §8.4.

## Escopo

- **Painel admin** em `/admin` (acesso restrito a `ADMIN_EMAILS`, usando **service role** apenas no servidor): visualizar contas (perfil, plano, vitrine, status), buscar usuária.
- **Bloqueio manual de conta**: suspender/reativar conta e/ou vitrine (caso de denúncia DMCA, abuso, conteúdo proibido — `docs/LEGAL.md` §4.2); vitrine bloqueada sai do ar com mensagem neutra.
- **Logs de auditoria** visíveis ao admin (consulta sobre `audit_logs` — quem fez o quê e quando; logs de IP de acesso/modificação por ≥ 6 meses — Marco Civil §3.2).
- **Métricas de produto agregadas**: dashboard interno com DAU, MAU, conversão por funil (visita → cadastro → onboarding → 1º produto → 5+ produtos → vitrine compartilhada → upgrade → retenção 6m — `docs/GTM.md` §5, `docs/ARCHITECTURE.md` §8.2), segmentado por canal de origem quando possível.
- **Health check de serviços**: status de banco, gateway de pagamento, e-mail (e Storage); página/endpoint `/admin/health` ou similar.
- **Sistema de denúncia de vitrine** (DMCA-like): o botão "Denunciar" na vitrine pública (entrada criada em #0012) abre um formulário; cria registro de denúncia; envia para `direitos@<domínio>`; SLA de resposta 48h; capacidade de **remover/ocultar o conteúdo enquanto investiga** (`docs/LEGAL.md` §2.2 camada 2).
- **Alertas** (coordena com #0024): webhook Asaas falhando 3x → Slack; latência do banco > 1s p95 → Slack; erro 5xx > 1% do tráfego → Slack + e-mail; Storage > 80% da quota → e-mail (`docs/ARCHITECTURE.md` §8.4).
- Selo "Embaixadora Pioneira" / plano embaixadora interno gerenciável pelo admin (coordena com #0025) — pode ser só uma flag no perfil/subscription.

### Fora de escopo (vai em outra issue)

- Backups e disaster recovery → #0024
- Testes E2E e auditoria de acessibilidade → #0024
- Páginas legais públicas e export de dados → #0021

## Tarefas

- [ ] `/admin` com guarda por `ADMIN_EMAILS`; service role só no servidor
- [ ] Listagem/busca de contas (perfil, plano, vitrine, status)
- [ ] Bloquear/reativar conta e vitrine; vitrine bloqueada exibe mensagem neutra
- [ ] Visualização dos `audit_logs` (filtros por ator/ação/data)
- [ ] Dashboard de métricas agregadas (DAU/MAU/funil, por canal quando possível)
- [ ] Health check de banco, pagamento, e-mail, Storage
- [ ] Sistema de denúncia: formulário a partir do botão da vitrine → registro + e-mail `direitos@` + SLA 48h + ação de ocultar conteúdo
- [ ] Alertas no Slack/e-mail conforme `ARCHITECTURE.md` §8.4 (coordena com #0024)
- [ ] Flag/plano de embaixadora gerenciável (coordena com #0025)
- [ ] Testes: não-admin não acessa `/admin`; bloqueio derruba a vitrine; denúncia gera registro + notificação

## Critérios de aceitação

- [ ] Apenas e-mails em `ADMIN_EMAILS` acessam `/admin`
- [ ] Admin consegue ver uma conta e bloqueá-la; a vitrine bloqueada sai do ar imediatamente
- [ ] Admin enxerga logs de auditoria e as métricas agregadas do produto
- [ ] Health check reporta corretamente serviço fora do ar
- [ ] "Denunciar" na vitrine cria um caso, notifica `direitos@`, e o conteúdo pode ser ocultado em < 48h
- [ ] Alertas críticos chegam ao canal configurado
- [ ] Critérios genéricos de aceitação (ver `issues/README.md`)

## Referências

- `docs/FEATURES.md` §8 (administração interna)
- `docs/ARCHITECTURE.md` §8 (observabilidade, alertas)
- `docs/LEGAL.md` §2.2 (denúncia DMCA-like), §3 (Marco Civil/logs), §4.2 (conteúdo proibido)
- `docs/GTM.md` §5 (funil), §7 (métricas de aquisição)
- `docs/DATABASE.md` §2.10 (`audit_logs`)
- `.env.example` (`ADMIN_EMAILS`)
- `docs/ROADMAP.md` Fase 3, Semana 12
