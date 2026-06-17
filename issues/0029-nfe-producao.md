# [0029] NF-e automática em produção

|                |                                                    |
| -------------- | -------------------------------------------------- |
| **Milestone**  | M7 — Lançamento                                    |
| **Roadmap**    | Fase 4 — Lançamento (Semana 14)                    |
| **Prioridade** | Must                                               |
| **Depende de** | #0028 (app em produção) + CNPJ/contador (de #0030) |

## Contexto

O código de NF-e já está entregue (issue #0025): camada `lib/fiscal/`, colunas `nfe_*` em `invoices`, retenção
fiscal de 5 anos em `invoice_archive`, e o cron horário `POST /api/cron/nfe`. Ele vem **desligado por padrão**
(`FISCAL_PROVIDER=none`). Esta issue faz a **ativação operacional**: habilitar o módulo de NF-e no Asaas,
concluir a inscrição municipal, obter o código de serviço e ligar a emissão em produção.

Toda fatura paga deve gerar NFS-e em ≤ 24h (`docs/PRICING.md` §7, `docs/LEGAL.md` §8). Depende de a empresa
estar constituída — por isso o CNPJ/contador (de #0030) é pré-requisito.

## Escopo

- Habilitar o **módulo de NF-e** na conta Asaas de produção.
- Concluir a **inscrição municipal** da empresa e obter o `ASAAS_MUNICIPAL_SERVICE_CODE` (código de serviço do
  município).
- Setar na Vercel (escopo Production) `FISCAL_PROVIDER=asaas` + `ASAAS_MUNICIPAL_SERVICE_CODE`; redeploy.
- Coordenar com o **contador** os dados fiscais (regime tributário, alíquota ISS, descrição do serviço).
- Validar o fluxo: uma fatura paga de teste deve gerar a NFS-e dentro da janela; conferir `invoices.nfe_id`/
  `nfe_url` preenchidos e o arquivamento em `invoice_archive`.

### Fora de escopo

- O código de emissão em si (já entregue na #0025).
- As ≥5 transações reais de lançamento → #0031.

## Tarefas

- [ ] Módulo de NF-e habilitado no Asaas de produção
- [ ] Inscrição municipal concluída; `ASAAS_MUNICIPAL_SERVICE_CODE` obtido
- [ ] `FISCAL_PROVIDER=asaas` + código municipal setados na Vercel; redeploy feito
- [ ] Dados fiscais validados com o contador
- [ ] Fatura paga de teste gerou NFS-e em ≤ 24h (cron horário)

## Critérios de aceitação

- [ ] Pagamento confirmado emite NFS-e automaticamente em ≤ 24h via `POST /api/cron/nfe`
- [ ] `invoices.nfe_id`/`nfe_url` preenchidos; dado fiscal preservado em `invoice_archive` (retenção 5 anos)
- [ ] Falha de emissão é reprocessável (respeita o limite de tentativas do handler)

## Referências

- `lib/fiscal/`, `app/api/cron/nfe/route.ts`
- `supabase/migrations/20260609140000_nfe.sql`, `20260609141000_nfe_cron.sql`
- `docs/PRICING.md` §7 (NF-e), `docs/LEGAL.md` §8 (retenção fiscal)
- `issues/0025-beta-fechado-e-lancamento.md` (código de NF-e entregue)
