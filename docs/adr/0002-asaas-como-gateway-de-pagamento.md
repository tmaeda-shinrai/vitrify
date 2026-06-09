# ADR-002: Asaas como gateway de pagamento

## Status

Aceito (MVP).

## Contexto

A monetização é uma assinatura recorrente (Free/Pro/Plus) cobrada no Brasil. Stripe
não trata bem PIX recorrente, não emite NF-e nacional e cobra em USD com IOF. Precisávamos
de PIX, boleto e cartão recorrentes, em BRL, com API simples (ver `docs/PRICING.md`).

## Decisão

Adotar **Asaas** como gateway, integrado por **webhook** (idempotente por `event_id`) e
**página de pagamento hospedada** (PIX/cartão/boleto). A camada de pagamento é abstraída
em `lib/payments/` (interface `PaymentGateway` + impl `AsaasGateway`), de modo que trocar
de gateway = trocar a implementação, não os call-sites.

## Consequências

- (+) PIX/boleto/cartão recorrentes nativos, em BRL, sem IOF.
- (+) Página hospedada reduz escopo de PCI/CPF (CPF/CNPJ forward-only, nunca persistido).
- (+) A abstração `PaymentGateway` isola o app de detalhes do fornecedor.
- (−) Webhook não é HMAC do corpo — autenticação por token compartilhado
  (`asaas-access-token`, `timingSafeEqual`); exige idempotência cuidadosa.
- (−) Ecossistema/documentação menores que os da Stripe.
- (−) NF-e (NFS-e) não entra automaticamente no MVP — fica como integração à parte (#0025).
