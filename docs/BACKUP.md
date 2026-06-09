# BACKUP — Backup e recuperação (DR)

Procedimento de backup e restauração do Vitrinio (#0024). Cumpre os alvos de
`docs/ARCHITECTURE.md` §10: **RTO 4h / RPO 24h**. Há duas camadas de backup.

## 1. Camadas de backup

### 1.1 Nativo do Supabase (diário) — primário

- **Automático**, gerenciado pelo Supabase. Retenção conforme o plano: **7 dias** (Free)
  ou **30 dias** (Pro). Em produção usamos o plano Pro.
- Configuração (uma vez), no dashboard do projeto de produção:
  - **Database → Backups**: confirmar que os backups diários estão ativos.
  - Recomendado no Pro: habilitar **Point-in-Time Recovery (PITR)** para granularidade
    de minutos (reduz o RPO efetivo bem abaixo de 24h).
- É a via primária de restauração (mais rápida; menor RPO).

### 1.2 Dump semanal externo (Wasabi/S3) — secundário/off-site

- Protege contra perda do projeto Supabase inteiro (conta/region) — backup **off-site**,
  fora do fornecedor primário. Retenção **90 dias**.
- Automatizado por **GitHub Actions**: `.github/workflows/backup.yml` (domingos 04:00 UTC),
  também disparável manualmente (`workflow_dispatch`). Faz `pg_dump` (schema + dados) →
  `gzip` → upload para o bucket.
- **Secrets** necessários (repo → Settings → Secrets → Actions): `BACKUP_DB_URL`,
  `BACKUP_S3_BUCKET`, `BACKUP_S3_ENDPOINT` (Wasabi; vazio p/ AWS), `BACKUP_S3_REGION`,
  `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.
- **Retenção 90d**: configurar uma **lifecycle rule** no bucket (expira objetos em
  `weekly/` após 90 dias) — não fica no workflow, é regra do storage.

## 2. Restore

### 2.1 A partir do backup nativo (caminho normal)

1. Supabase dashboard → **Database → Backups** → escolher o ponto (backup diário ou PITR).
2. **Restaurar** (cria/sobrescreve conforme a opção). Para teste, restaurar em um
   **projeto isolado** (ver §3), nunca direto em produção sem necessidade.
3. Validar (§2.3) e, se for incidente real, repontar a aplicação (envs) ao projeto restaurado.

### 2.2 A partir do dump externo (perda do projeto)

Pré-requisitos: um projeto Postgres/Supabase **novo e vazio** (de preferência mesma versão, PG15).

```bash
# 1. Baixar o dump mais recente do storage externo
aws s3 ls   s3://$BUCKET/weekly/ --endpoint-url $ENDPOINT
aws s3 cp   s3://$BUCKET/weekly/vitrinio-<STAMP>.sql.gz . --endpoint-url $ENDPOINT

# 2. Restaurar no banco alvo (connection string do projeto novo)
gunzip -c vitrinio-<STAMP>.sql.gz | psql "$TARGET_DB_URL"
```

3. Reaplicar o que NÃO vem no dump lógico de dados: buckets/políticas de Storage e
   objetos (as imagens ficam no Supabase Storage, não no Postgres — restaurar do backup
   nativo de Storage ou re-sincronizar), e os GUCs/cron (`app.cron_*`, agendamentos pg_cron).
4. Apontar a aplicação (envs `NEXT_PUBLIC_SUPABASE_URL`/chaves/`SUPABASE_DB_URL`) ao novo projeto.
5. Validar (§2.3).

> Observação: o `pg_dump` lógico cobre o **schema + dados** do Postgres. Os **objetos do
> Storage** (imagens de produto/avatar) têm o backup nativo do Supabase como via primária;
> a recriação a partir de URLs públicas é o fallback.

### 2.3 Validação pós-restore

- `select count(*) from auth.users;` e `from public.products;` retornam volumes plausíveis.
- Login de uma conta de teste funciona; uma vitrine pública abre e lista produtos.
- Migrations conferem: `select max(version) from supabase_migrations.schema_migrations;`.

## 3. Teste de restore mensal (operacional)

Alvo de DR só vale se for **testado**. Mensalmente (responsável: operador), em ambiente
**isolado** (projeto Supabase de staging/descartável — nunca produção):

- [ ] Restaurar o dump externo mais recente num projeto vazio (§2.2).
- [ ] Rodar a validação (§2.3) e cronometrar o tempo total (alvo **RTO < 4h**).
- [ ] Conferir que a idade do último dump respeita o **RPO < 24h** combinado com o
      backup nativo diário (o dump externo é semanal; o RPO de 24h é coberto pelo nativo).
- [ ] Registrar data, duração e resultado (abaixo) e destruir o projeto de teste.

| Data        | Origem (nativo/dump) | Duração | Resultado | Notas                       |
| ----------- | -------------------- | ------- | --------- | --------------------------- |
| _a definir_ |                      |         |           | primeiro teste após go-live |

> Este teste é um passo **operacional** e ainda não foi executado (depende de credenciais
> e de um projeto de produção/staging real). Registrar o primeiro resultado no go-live.
