# CONTRIBUTING — Padrões de Desenvolvimento

Mesmo desenvolvendo solo no início, manter padrões consistentes paga dividendos enormes quando o projeto cresce e quando outras pessoas (freelancer, contratada, sócia) entram no código. Este documento é o "manual de regras" do dia a dia.

## 1. Fluxo de trabalho

### 1.1 Branches

- `main` — branch protegida, somente recebe merge via PR. Deploy automático para produção.
- `staging` — recebe merges para teste integrado. Deploy automático para staging.
- `feat/nome-curto` — features novas
- `fix/descricao-do-bug` — correção de bugs
- `chore/atualizacao-deps` — manutenção, deps, refatoração sem mudança de comportamento
- `docs/atualiza-readme` — apenas documentação

### 1.2 Commits (Conventional Commits)

Padrão `tipo(escopo): descrição em português`:

```
feat(produto): permite cadastrar até 5 imagens
fix(checkout): corrige loop ao falhar pagamento PIX
chore(deps): atualiza next para 14.2.5
docs(database): adiciona seção sobre RLS
refactor(auth): extrai hook useCurrentUser
test(intent): adiciona teste E2E do botão WhatsApp
style(produto): ajusta espaçamento do card
```

Tipos válidos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`.

### 1.3 Pull Requests

Toda mudança vai em PR. Auto-merge não permitido (nem mesmo para você mesmo). Critérios de merge:

- [ ] Descrição clara do que muda e por quê
- [ ] CI passando (lint, typecheck, testes)
- [ ] Screenshot ou GIF se mudou UI
- [ ] Sem console.log esquecido
- [ ] Documentação atualizada se mudou comportamento
- [ ] Migration adicionada se mudou schema
- [ ] Verificação manual local antes de marcar como pronto

PRs devem ser **pequenos**. Se passou de 500 linhas alteradas, é hora de quebrar.

### 1.4 Code Review

Mesmo solo, fazer review do próprio PR depois de 2h ou no dia seguinte. Distância temporal pega 80% dos descuidos. Se possível, trocar reviews com outro dev (mesmo informalmente).

## 2. Convenções de código

### 2.1 TypeScript

- Modo **strict** habilitado em `tsconfig.json`. Nunca afrouxar.
- Sem `any`. Use `unknown` quando o tipo é mesmo desconhecido e valide.
- Tipos em `types/` quando compartilhados. Tipos locais inline quando usados em um único arquivo.
- Schemas Zod compartilhados entre cliente e servidor em `lib/validators/`.

### 2.2 Nomenclatura

| Item                   | Convenção                        | Exemplo                    |
| ---------------------- | -------------------------------- | -------------------------- |
| Arquivos de componente | kebab-case                       | `product-card.tsx`         |
| Componentes React      | PascalCase                       | `<ProductCard />`          |
| Hooks                  | camelCase com prefixo `use`      | `useCurrentUser()`         |
| Funções utilitárias    | camelCase                        | `formatCurrency()`         |
| Constantes globais     | SCREAMING_SNAKE_CASE             | `MAX_PRODUCTS_FREE`        |
| Tipos TS               | PascalCase                       | `type Product = {...}`     |
| Tabelas SQL            | snake_case plural                | `product_images`           |
| Colunas SQL            | snake_case                       | `created_at`               |
| Variáveis de ambiente  | SCREAMING_SNAKE_CASE com prefixo | `NEXT_PUBLIC_SUPABASE_URL` |

### 2.3 Estrutura de arquivos

- Um componente por arquivo
- Componente principal no topo, helpers abaixo
- Imports na ordem: bibliotecas → módulos do projeto → arquivos locais → tipos
- Sem `default export` em componentes (exceto pages do Next), apenas named exports

### 2.4 Tailwind

- Sem CSS solto exceto em `globals.css` para tokens e estilos verdadeiramente globais
- Classes longas: usar `cn()` (de `clsx` + `tailwind-merge`)
- Componentes com variantes: usar `class-variance-authority` (cva)
- Tokens semânticos definidos em `tailwind.config.ts` (cores como `brand-primary`, não `purple-600`)

### 2.5 Server Components vs Client Components

Padrão é **Server Component**. Marcar com `"use client"` apenas quando precisa de:

- Hooks de estado (useState, useReducer)
- Hooks de efeito (useEffect, useLayoutEffect)
- Eventos do navegador (onClick, onChange)
- APIs do navegador (window, document, localStorage)
- Bibliotecas que são client-only

Quanto menos client components, mais rápido.

### 2.6 Formulários

- React Hook Form + Zod via resolver
- Schemas em `lib/validators/`
- Loading state via `formState.isSubmitting`
- Sempre desabilitar botão durante submit
- Toast de sucesso após `onSubmit` resolver

### 2.7 Acesso ao banco

- Toda query via cliente Supabase tipado (gerar types via `supabase gen types`)
- Query no server: usar cliente server (`createClient` em `lib/supabase/server.ts`)
- Query no client: usar cliente browser, encapsulado em hook do TanStack Query
- Mutações que mudam estado complexo: Server Actions ou Route Handlers (não cliente direto)

## 3. Testes

### 3.1 Estratégia

| Camada     | Ferramenta               | Cobertura alvo                                                       |
| ---------- | ------------------------ | -------------------------------------------------------------------- |
| Unitários  | Vitest                   | Funções utilitárias, validators, hooks complexos                     |
| Integração | Vitest + Testing Library | Componentes com lógica de estado                                     |
| E2E        | Playwright               | Fluxos críticos: cadastro, criar produto, vitrine pública, pagamento |

**Não buscar 100% de cobertura.** Buscar cobertura **dos caminhos críticos**.

### 3.2 Fluxos E2E críticos (Playwright)

1. Cadastro → onboarding → primeiro produto
2. Criar produto com foto → ver na vitrine pública
3. Cliente final clica em "Pedir no WhatsApp" → intent registrada
4. Free atinge limite → upgrade para Pro → produto extra liberado
5. Cancelar plano → mantém acesso até fim do período

### 3.3 Convenções de teste

```
descrição em portugûes:
- describe blocks: "Cadastro de produto"
- it/test blocks: "deve mostrar erro se preço for negativo"
```

Arquivos `.test.ts` ou `.spec.ts` ao lado do código testado.

## 4. Segurança no dia a dia

- **Nunca** comitar `.env.local`. `.gitignore` cobre, mas dupla checagem.
- **Nunca** logar e-mail, telefone, CPF ou dados de pagamento. Mesmo em dev.
- **Sempre** validar input no servidor com Zod (cliente é UX, não segurança).
- **Sempre** usar RLS quando há dados de usuário envolvidos. Service role só em rotas de webhook ou admin.
- **Sempre** sanitizar HTML/Markdown vindo de input antes de renderizar.
- Service Role Key **nunca** vai para o cliente. Apenas em route handlers e server actions.
- Tokens em links (recuperação de senha, magic link): expiram em 1h, single-use.
- Webhooks: validar HMAC sempre. Idempotência via `event_id`.

## 5. Performance

### 5.1 Antes de adicionar uma biblioteca

- O navegador já faz isso? (Web APIs cresceram muito)
- O Next.js já faz isso? (Image, Font, Script, Link)
- Tem alternativa menor? (date-fns vs Moment, zod vs yup)
- Quanto pesa? (verificar em bundlephobia.com)

### 5.2 Imagens

- `next/image` sempre. Nunca `<img>` direto.
- `priority={true}` apenas no LCP (hero da vitrine, foto do produto principal)
- Tamanhos explícitos (width, height) para evitar CLS
- Compressão no cliente antes do upload (browser-image-compression)

### 5.3 Bundle

- Imports nominais (`import { Button } from 'lucide-react'`), nunca import \*
- Lazy load de componentes pesados: `dynamic()` do Next
- Análise periódica com `@next/bundle-analyzer`

## 6. Banco de dados

### 6.1 Migrations

- Toda mudança de schema é uma **migration nova**, nunca editar existente
- Nome: `YYYYMMDDHHMMSS_descricao.sql`
- Migrations idempotentes quando possível (`IF NOT EXISTS`, `ON CONFLICT`)
- Mudança destrutiva em duas etapas: adiciona o novo, depois remove o velho em PR separado

### 6.2 Queries

- Sempre `SELECT` com colunas explícitas, nunca `SELECT *`
- Sempre `LIMIT` em listas
- Indexar colunas usadas em `WHERE`, `ORDER BY` e joins
- `EXPLAIN ANALYZE` em queries que parecem lentas

## 7. Variáveis de ambiente

- Listadas em `.env.example` com valor de exemplo (sem segredos reais)
- Tipadas em `lib/env.ts` com Zod (falha o build se faltar)
- Prefixadas com `NEXT_PUBLIC_` apenas se realmente devem ir ao cliente
- Diferentes valores para staging e produção (Vercel envs)

## 8. Documentação

- README.md atualizado com setup atual
- DOC dos `docs/` atualizada quando mudar comportamento relevante
- Comentários no código apenas quando o código não consegue ser auto-explicativo
- TODOs marcados com `// TODO(motivo):` e quando possível com link para issue

## 9. Dependências

- Atualização semanal: `pnpm outdated` e merge das atualizações de patch
- Atualizações de major: PR dedicado, com tempo para testar
- Auditoria de segurança: `pnpm audit` semanal
- Sem instalar pacote sem revisar: tamanho, manutenção ativa, alternativas

## 10. Como pedir ajuda (quando trava)

Quando algo trava por mais de 1h:

1. Reformule o problema por escrito (50% das vezes resolve)
2. Pesquise no GitHub Issues do projeto da lib
3. Stack Overflow / Reddit / Discord da comunidade Next.js ou Supabase
4. Pergunte para a IA explicando o contexto e o que já tentou
5. Pause, faça outra coisa, volta com cabeça fresca

Documente a solução depois — para você mesmo daqui a 6 meses.
