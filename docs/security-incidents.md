# Plano de Resposta a Incidentes de Segurança

> Documento operacional do Vitrinio (#0021). Atende `docs/LEGAL.md` §1.7 (LGPD Art. 48 —
> comunicação de incidente à ANPD e aos titulares). Revisar a cada 6 meses ou após cada
> incidente. Não substitui orientação jurídica; em incidente relevante, acionar advogado.

## 1. Definições

- **Incidente de segurança**: qualquer evento que comprometa a confidencialidade, integridade
  ou disponibilidade de dados pessoais (vazamento, acesso indevido, perda, ransomware, exposição
  acidental de credenciais, etc.).
- **Incidente relevante** (gatilho de notificação à ANPD): incidente que possa acarretar risco ou
  dano relevante aos titulares (ex.: exposição de e-mails, WhatsApp, dados de pagamento).

## 2. Papéis

- **Encarregado (DPO)**: `dpo@vitrinio.com.br` — coordena a resposta e a comunicação com a ANPD e os
  titulares.
- **Responsável técnico**: sócio/dev de plantão — executa a contenção e a investigação técnica.

(No MVP, ambos os papéis podem recair sobre o mesmo sócio.)

## 3. Fluxo de resposta

Seguir as cinco etapas, registrando horário e responsável de cada ação:

### 3.1 Conter (imediato)

- Revogar credenciais comprometidas: rotacionar `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`,
  `ASAAS_*`, `CRON_SECRET`, segredos do Sentry e tokens de OAuth no painel do provedor.
- Invalidar sessões ativas se necessário (Supabase Auth → revogar refresh tokens).
- Isolar o sistema afetado (desabilitar rota/feature, colocar a aplicação em manutenção se preciso).

### 3.2 Avaliar (até 24h)

- Escopo: quais dados, quantos titulares, janela temporal.
- Origem: causa raiz provável (credencial vazada, dependência vulnerável, erro de configuração/RLS).
- Risco aos titulares: e-mail/WhatsApp/pagamento expostos? Há risco de fraude ou dano?

### 3.3 Notificar

- **ANPD**: se incidente relevante, comunicar em **prazo razoável** (referência interna: até 2 dias
  úteis da ciência), pelo canal oficial da ANPD, com a descrição, dados afetados, medidas tomadas e
  de mitigação.
- **Titulares afetados**: comunicar de forma clara (e-mail via Resend), descrevendo o ocorrido, os
  riscos e as recomendações (ex.: trocar senha).
- **Parceiros**: acionar suporte do provedor afetado (Supabase, Asaas, Resend, Vercel) quando a
  origem for deles.

### 3.4 Documentar

- Registrar a linha do tempo completa, decisões, comunicações e evidências em um relatório de
  incidente (mínimo 5 anos). Consultar `audit_logs` (retém 180 dias) para reconstruir ações.

### 3.5 Corrigir

- Eliminar a causa raiz, aplicar correção e medidas preventivas (rotação de segredos, hardening de
  RLS, atualização de dependências, alertas no Sentry).
- Pós-morte sem culpados: o que falhou, o que detectou, o que evitaria a recorrência.

## 4. Contatos e canais

| Item               | Onde                                                        |
| ------------------ | ----------------------------------------------------------- |
| DPO / titulares    | `dpo@vitrinio.com.br`, `direitos@vitrinio.com.br`           |
| ANPD               | https://www.gov.br/anpd (canal de comunicação de incidente) |
| Observabilidade    | Sentry (erros, com PII anonimizada — `lib/observability`)   |
| Auditoria de ações | tabela `audit_logs` (180 dias)                              |
| Provedores         | Supabase, Asaas, Resend, Vercel (suporte de cada um)        |

## 5. Prevenção (controles vigentes)

- RLS em todas as tabelas com dados de usuária; service role só em rotas de webhook/cron/admin.
- Segredos só no servidor, validados no boot (`lib/env.ts`); nunca expostos ao browser.
- IP sempre como hash SHA-256 (`hashIp`), nunca cru; PII anonimizada no Sentry.
- Auditoria automática de ações sensíveis (triggers → `audit_logs`) e retenção com limpeza agendada.
- CPF/CNPJ forward-only ao gateway (nunca persistido).
