# ADR-001: Supabase como BaaS

## Status

Aceito (MVP).

## Contexto

Precisávamos de banco, autenticação e storage rapidamente, com um perfil de
desenvolvedor iniciante/intermediário e orçamento de MVP. Requisitos: Postgres real
(schema relacional, SQL, backups), auth com Google e regras de segurança no banco,
storage de imagens, região no Brasil (latência + LGPD) e free tier generoso.

## Decisão

Adotar **Supabase** (Postgres 15 + Auth + Storage + Edge Functions) como backend
gerenciado, com **RLS** em todas as tabelas com dados de usuária e clients separados
(`server`, `browser`, `public` anon, `admin` service role).

## Consequências

- (+) Velocidade de desenvolvimento alta: banco, auth e storage integrados.
- (+) RLS força a segurança no banco (defesa em profundidade além da app).
- (+) Postgres real: SQL, triggers, full-text, migrations versionadas.
- (+) Região São Paulo e free tier adequado ao início.
- (−) Lock-in parcial (Auth e Storage); migração exigiria reescrever essas camadas.
- (−) Custo cresce com escala (conexões, storage); mitigável com Pro + otimizações.
- (−) Service role precisa ficar restrita a webhook/admin no servidor (nunca no cliente).
