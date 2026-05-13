# [0005] Autenticação por e-mail/senha e recuperação

| | |
|---|---|
| **Milestone** | M1 — Conta e autenticação |
| **Roadmap** | Fase 1, Semana 1 |
| **Prioridade** | Must |
| **Planos** | Todos |
| **Depende de** | #0001, #0002, #0003, #0004 |
| **Relacionada** | #0006, #0007, #0008 |

## Contexto

Fluxo essencial de entrada na plataforma com Supabase Auth (JWT). Cobre cadastro com confirmação de e-mail obrigatória, login e recuperação de senha. Implementa as rotas do grupo `app/(auth)/` (`login`, `cadastro`, `recuperar-senha`) descrito em `docs/ARCHITECTURE.md` §4.

## Escopo

- Páginas `app/(auth)/cadastro`, `app/(auth)/login`, `app/(auth)/recuperar-senha` (+ rota de callback/confirmação).
- Cadastro com e-mail e senha → e-mail de confirmação obrigatório (Supabase Auth + template via Resend); só ativa após confirmar.
- Login com e-mail/senha; mensagens de erro claras (credenciais inválidas, e-mail não confirmado).
- Recuperação de senha: link mágico expirando em **1h**, single-use; tela para definir nova senha.
- Clientes Supabase: `lib/supabase/server.ts` (server) e `lib/supabase/browser.ts` (browser), tipados com `types/supabase.ts`. Middleware de sessão (refresh de cookies).
- Formulários com React Hook Form + Zod (schemas em `lib/validators/auth.ts`), botão desabilitado durante submit, loading/toast (`docs/DESIGN.md` §4.3–4.4, `docs/CONTRIBUTING.md` §2.6).
- Rate limiting de login: **5 tentativas / 15 min por IP** (`docs/ARCHITECTURE.md` §6.4) via Upstash.
- Política de senha mínima razoável; nunca logar e-mail/senha (`docs/CONTRIBUTING.md` §4).
- Verificação de e-mail obrigatória também serve como mitigação contra contas falsas abusando do Free (`docs/GTM.md` §8).

### Fora de escopo (vai em outra issue)

- Login com Google → #0006
- Layout do dashboard e guarda de rotas autenticadas → #0007
- Onboarding pós-cadastro → #0008
- 2FA, login Facebook/Apple → backlog (Could, v2)

## Tarefas

- [ ] `lib/supabase/server.ts`, `lib/supabase/browser.ts`, middleware de sessão
- [ ] `lib/validators/auth.ts` (Zod): cadastro, login, reset, nova senha
- [ ] Página/UX de cadastro + envio de e-mail de confirmação + tela "verifique seu e-mail"
- [ ] Rota de callback de confirmação de e-mail
- [ ] Página/UX de login
- [ ] Página/UX de recuperação de senha (solicitar + redefinir), token 1h single-use
- [ ] Templates de e-mail (confirmação, recuperação) via Resend, em pt-BR
- [ ] Rate limit de login (5/15min por IP)
- [ ] Redirecionos: já logado em `/login` → dashboard; não logado em rota protegida → `/login`
- [ ] Testes: caminho feliz de cadastro→confirmação→login; erro de senha; reset

## Critérios de aceitação

- [ ] Cadastro envia e-mail; conta só funciona após confirmar
- [ ] Login com credenciais corretas leva ao dashboard (ou onboarding, ver #0008); credenciais erradas mostram erro claro
- [ ] Link de recuperação expira em 1h e não pode ser reusado
- [ ] 6ª tentativa de login no mesmo IP em 15 min é bloqueada com mensagem amigável
- [ ] Sessão persiste entre reloads; logout limpa a sessão
- [ ] Critérios genéricos de aceitação (ver `issues/README.md`)

## Referências

- `docs/FEATURES.md` §1 (autenticação e conta)
- `docs/ARCHITECTURE.md` §3.2 (auth), §4 (rotas `(auth)`), §6.4 (rate limiting)
- `docs/DATABASE.md` §2.1, §3.1 (trigger `handle_new_user`), §4.1
- `docs/DESIGN.md` §4.3–4.4 (formulários, feedback)
- `docs/CONTRIBUTING.md` §2.6 (formulários), §2.7 (acesso ao banco), §4 (segurança)
- `docs/LEGAL.md` §1.3 (dados coletados — e-mail, senha hash)
- `docs/ROADMAP.md` Fase 1, Semana 1
