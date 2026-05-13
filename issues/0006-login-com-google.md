# [0006] Login com Google (OAuth)

| | |
|---|---|
| **Milestone** | M1 — Conta e autenticação |
| **Roadmap** | Fase 1, Semana 1 |
| **Prioridade** | Must |
| **Planos** | Todos |
| **Depende de** | #0002 (OAuth configurado no Supabase), #0005 |
| **Relacionada** | #0008 |

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

- [ ] Botão de login com Google (componente reutilizável) nas telas de login/cadastro
- [ ] Rota de callback OAuth + tratamento de erro (usuário cancelou, etc.)
- [ ] Verificar criação automática de profile/subscription/vitrine no primeiro login
- [ ] Decidir e implementar comportamento para e-mail já existente
- [ ] (Opcional) pré-popular nome/avatar a partir do perfil Google
- [ ] Teste E2E do fluxo (com conta de teste ou mock do provider)

## Critérios de aceitação

- [ ] "Continuar com Google" autentica e leva ao onboarding (primeira vez) ou ao dashboard (já onboarded)
- [ ] Primeira entrada cria profile + subscription free + vitrine inativa
- [ ] Cancelar o consentimento volta para a tela de login com mensagem amigável
- [ ] Critérios genéricos de aceitação (ver `issues/README.md`)

## Referências

- `docs/FEATURES.md` §1 (login com Google)
- `docs/ARCHITECTURE.md` §3.2 (auth)
- `docs/DATABASE.md` §3.1 (trigger `handle_new_user`)
- `docs/ROADMAP.md` Fase 1, Semana 1
