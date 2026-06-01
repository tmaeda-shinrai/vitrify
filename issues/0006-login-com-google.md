# [0006] Login com Google (OAuth)

|                 |                                              |
| --------------- | -------------------------------------------- |
| **Milestone**   | M1 — Conta e autenticação                    |
| **Roadmap**     | Fase 1, Semana 1                             |
| **Prioridade**  | Must                                         |
| **Planos**      | Todos                                        |
| **Depende de**  | #0002 (OAuth configurado no Supabase), #0005 |
| **Relacionada** | #0008                                        |

## Contexto

Reduzir a fricção do cadastro com login social via Google, usando o provider nativo do Supabase Auth. É o caminho preferido de entrada para parte do público.

## Escopo

- Botão "Continuar com Google" nas telas de login e cadastro.
- Fluxo OAuth via Supabase Auth (provider Google já configurado no painel em #0002); rota de callback OAuth.
- No primeiro login, o trigger `handle_new_user` (#0003) cria `profile` (usando `full_name` do `raw_user_meta_data` quando disponível), `subscription free` e `vitrine` inativa — em seguida o usuário cai no onboarding (#0008).
- Tratar conflito de e-mail: se já existe conta por e-mail/senha com o mesmo e-mail, comportamento definido (vincular ou orientar) — registrar a decisão.
- Avatar do Google pode pré-popular `avatar_url` no onboarding (opcional).

### Fora de escopo (vai em outra issue)

- Login Facebook/Apple → backlog (Could; Apple obrigatório se virar app nativo)
- Onboarding em si → #0008

## Tarefas

- [x] Botão de login com Google (componente reutilizável) nas telas de login/cadastro
- [x] Rota de callback OAuth + tratamento de erro (usuário cancelou, etc.)
- [x] Verificar criação automática de profile/subscription/vitrine no primeiro login (trigger `handle_new_user`, #0003)
- [x] Decidir e implementar comportamento para e-mail já existente — **vinculação automática do Supabase** (e-mail verificado do Google liga à conta existente; `enable_manual_linking=false`)
- [ ] (Opcional) pré-popular nome/avatar a partir do perfil Google — `full_name` já vem do trigger; `avatar_url` deferido para o onboarding #0008
- [x] Teste E2E do fluxo (botão visível + cancelamento; happy-path real do Google documentado como verificação manual)

## Critérios de aceitação

- [x] "Continuar com Google" autentica e redireciona pós-login (destino `/dashboard`; o roteamento onboarding-vs-dashboard usa `profiles.onboarding_completed_at` e fica com #0007/#0008)
- [x] Primeira entrada cria profile + subscription free + vitrine inativa (trigger `handle_new_user`)
- [x] Cancelar o consentimento volta para a tela de login com mensagem amigável
- [ ] Critérios genéricos de aceitação (ver `issues/README.md`)

## Referências

- `docs/FEATURES.md` §1 (login com Google)
- `docs/ARCHITECTURE.md` §3.2 (auth)
- `docs/DATABASE.md` §3.1 (trigger `handle_new_user`)
- `docs/ROADMAP.md` Fase 1, Semana 1
