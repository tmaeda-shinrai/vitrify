# [0009] Perfil, conta e exclusão de conta (LGPD)

| | |
|---|---|
| **Milestone** | M1 — Conta e autenticação |
| **Roadmap** | Fase 1, Semana 2 |
| **Prioridade** | Must |
| **Planos** | Todos |
| **Depende de** | #0003, #0007 |
| **Relacionada** | #0008 (reusa `ImageUploader`), #0021 (export de dados) |

## Contexto

Tela "Conta" do painel: edição de perfil (nome, foto, bio, WhatsApp, slug da vitrine) e o fluxo de exclusão de conta exigido pela LGPD. Inclui o componente reutilizável de upload de imagem com compressão no cliente, usado também no onboarding e no cadastro de produto.

## Escopo

- Tela `app/(dashboard)/conta`: editar `full_name`, `bio` (≤ 160 caracteres, com contador), `whatsapp` (com revalidação de formato), `avatar_url`, e o `slug`/`title`/`subtitle` da vitrine.
- Troca de slug: mesma validação de #0008 (formato, disponibilidade, blacklist); aviso de que o link antigo deixa de funcionar.
- **`ImageUploader`** (componente de `docs/DESIGN.md` §3): seleção/câmera → compressão no cliente (`browser-image-compression`: máx 1200px de largura, ≤ 500KB, saída webp) → preview com crop quadrado → upload direto ao Supabase Storage via **signed URL** → grava a URL. Bloquear upload de SVG; validar MIME no servidor (`docs/ARCHITECTURE.md` §5.1, §6.5).
- Sanitização da bio contra XSS antes de renderizar (`docs/ARCHITECTURE.md` §6.5).
- **Exclusão de conta** (`docs/FEATURES.md` §1; `docs/LEGAL.md` §1.4): botão "Excluir minha conta" → confirmação modal → anonimização em até 30 dias, exclusão completa em 90 dias; comunica claramente o efeito (vitrine sai do ar, dados removidos, sem volta). Implementar o pedido (marca a conta) e o job/processo de anonimização (pode ser função agendada / edge function).
- Estados de upload (loading > 300ms → skeleton/spinner), toasts de sucesso/erro (`docs/DESIGN.md` §4.4).
- Atualização otimista do cache e revalidação da vitrine pública quando muda dado que aparece nela (nome, foto, bio, slug → `revalidatePath`).

### Fora de escopo (vai em outra issue)

- Export de dados em JSON/CSV (portabilidade LGPD) → #0021
- Tela "Meu plano" / faturas → #0019
- Configurações de privacidade / revogação de consentimento → #0021
- Verificação de WhatsApp por SMS → backlog

## Tarefas

- [ ] Tela "Conta" com formulário de perfil (RHF + Zod, `lib/validators/profile.ts`)
- [ ] Editar nome, bio (contador 160), WhatsApp, slug/title/subtitle da vitrine
- [ ] `ImageUploader`: compressão cliente (webp, ≤1200px, ≤500KB), preview+crop quadrado, upload via signed URL
- [ ] Validação de MIME no servidor; bloqueio de SVG
- [ ] Sanitização da bio (render seguro)
- [ ] Troca de slug com revalidação + aviso de quebra do link antigo
- [ ] Fluxo de exclusão de conta: confirmação → marca conta → processo de anonimização (30d) e exclusão (90d)
- [ ] `revalidatePath('/<slug>')` ao alterar dados visíveis na vitrine
- [ ] Testes: editar bio com >160 chars (erro); upload de SVG bloqueado; pedido de exclusão registrado

## Critérios de aceitação

- [ ] Alterar nome/foto/bio reflete na vitrine pública em até ~60s (ISR) ou imediatamente via revalidate
- [ ] Bio acima de 160 caracteres é bloqueada com mensagem clara
- [ ] Upload de imagem comprime no cliente antes de enviar; SVG é recusado; resultado é webp
- [ ] "Excluir minha conta" pede confirmação e, ao confirmar, registra o pedido; documentação do prazo de anonimização visível ao usuário
- [ ] Critérios genéricos de aceitação (ver `issues/README.md`)

## Referências

- `docs/FEATURES.md` §1 (edição de perfil, exclusão de conta)
- `docs/DESIGN.md` §3 (`ImageUploader`), §4.3–4.5 (formulários, feedback, imagens)
- `docs/ARCHITECTURE.md` §5.1 (fluxo de upload), §6.5 (conteúdo de usuário/XSS/MIME)
- `docs/DATABASE.md` §2.1 (`profiles`), §2.2 (`vitrines`)
- `docs/LEGAL.md` §1.4 (direitos do titular), §1.5 (retenção: anonimização 30d / exclusão 90d)
- `docs/CONTRIBUTING.md` §2.6 (formulários), §4 (segurança), §5.2 (imagens)
- `docs/ROADMAP.md` Fase 1, Semana 2
