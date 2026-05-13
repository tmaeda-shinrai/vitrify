# PRICING — Monetização e Planos

## 1. Modelo de negócio

Modelo SaaS por assinatura recorrente, com plano Free permanente como porta de entrada. Receita vem da conversão Free → Pro/Plus, alimentada por crescimento orgânico (efeito rede das vitrines indexadas no Google) e aquisição direcionada (ver [GTM.md](./GTM.md)).

## 2. Planos e preços

| Plano | Preço mensal | Preço anual (-20%) | Público-alvo |
|---|---|---|---|
| **Free** | R$ 0 | — | Quem está testando, vendedora iniciante, validação |
| **Pro** | R$ 39,00 | R$ 374,40 (R$ 31,20/mês) | Maioria das revendedoras ativas, com 10-50 produtos |
| **Plus** | R$ 69,00 | R$ 662,40 (R$ 55,20/mês) | Revendedoras profissionais, alto volume, multimarca pesada |

Detalhe de funcionalidades por plano em [FEATURES.md](./FEATURES.md).

### 2.1 Justificativa de preço

A análise de mercado original sugeria faixa de R$ 19,90 a R$ 39,90 — discutimos em conversa anterior por que isso era subprecificação.

**Por que R$ 39 e não R$ 19?**

A revendedora ativa fatura em média alguns milhares de reais por mês. R$ 39 representa muito pouco do faturamento dela e é compatível com o que ela já paga em outras ferramentas digitais (Hotmart Producer R$ 97, Sympla, planos de aulas online). Preço baixo demais transmite baixo valor percebido. Mesmo no Free, ela recebe valor real — é o trampolim, não a meta.

**Por que oferecer Plus se Pro já tem produtos ilimitados?**

Plus existe para quem quer máximo profissionalismo: vídeos no produto, múltiplas vitrines (útil para quem segmenta por marca: maria-avon, maria-natura), domínio próprio. Captura disposição a pagar maior de quem fatura mais.

**Por que Free é permanente, não trial?**

Trial força decisão antes da revendedora colher os primeiros frutos. Free permanente:
- Vira marketing passivo (cada vitrine no Free indexada no Google é tráfego orgânico)
- Permite efeito rede (clientes finais se acostumam com `vitrinio.com.br/...` como padrão)
- Reduz fricção do cadastro
- Limite de 5 produtos é apertado o suficiente para forçar upgrade quem leva a sério

## 3. Gateway de pagamento

### 3.1 Escolha: Asaas como preferencial

Avaliamos Stripe, Pagar.me, Asaas, Mercado Pago e Pagseguro. Asaas vence pelo conjunto:

| Critério | Asaas | Stripe BR | Pagar.me | Mercado Pago |
|---|---|---|---|---|
| PIX recorrente | Sim | Limitado | Sim | Sim |
| Boleto recorrente | Sim | Não | Sim | Sim |
| Cartão recorrente | Sim | Sim | Sim | Sim |
| Nota fiscal automática | Sim (integração) | Não | Sim (terceiros) | Não |
| Webhook documentação | Boa | Excelente | Boa | Confusa |
| Taxa cartão | ~2.99% + R$ 0,49 | 3.99% + R$ 0,39 | ~3.49% | ~4.99% |
| Taxa PIX | R$ 1,99 fixo | R$ 1,49 + 0,99% | R$ 0,99 | Variável |
| Mensalidade | R$ 0 | R$ 0 | R$ 0 | R$ 0 |
| API simples | Sim | Sim | Sim | Não |

PIX é decisivo. No público-alvo, é o método dominante e o que tem menor abandono no checkout.

### 3.2 Pagar.me como segunda opção

Caso Asaas apresente algum problema operacional (suporte, instabilidade, mudança de termos), Pagar.me é o backup pré-validado. A camada de pagamento deve ser abstraída em `lib/payments/` para troca relativamente indolor.

## 4. Métricas de receita

### 4.1 KPIs de monetização

| Métrica | Meta mês 6 | Meta mês 12 |
|---|---|---|
| MRR (Receita Recorrente Mensal) | R$ 5.000 | R$ 25.000 |
| ARPU (Receita Média por Usuária Paga) | R$ 42 | R$ 45 |
| Conversão Free → Pago | 8% | 12% |
| Churn mensal | < 6% | < 4% |
| LTV médio | R$ 700 | R$ 1.200 |
| CAC | R$ 80 | R$ 100 |
| LTV/CAC | ≥ 3 | ≥ 5 |
| Payback do CAC | < 4 meses | < 3 meses |

### 4.2 Modelagem simples

Com conversão de 8% e churn de 6% mensais, partindo de 0:

| Mês | Free novos | Free ativos | Pago novos | Pago total | MRR |
|---|---|---|---|---|---|
| 1 | 100 | 100 | 8 | 8 | R$ 312 |
| 2 | 150 | 240 | 12 | 19 | R$ 741 |
| 3 | 250 | 470 | 20 | 38 | R$ 1.482 |
| 4 | 400 | 820 | 32 | 67 | R$ 2.613 |
| 5 | 600 | 1.350 | 48 | 111 | R$ 4.329 |
| 6 | 800 | 2.030 | 64 | 168 | R$ 6.552 |

(Modelo simplificado, ignora upgrades para Plus, cupons e churn diferenciado.)

## 5. Estratégia de conversão

### 5.1 Gatilhos para upgrade

A maior parte das conversões Free → Pro deve ser disparada por **fricção contextual**, não por marketing:

1. **Limite de produtos atingido.** Modal claro mostrando o que muda no Pro, com CTA forte. Maior taxa de conversão histórica em SaaS.
2. **Tentativa de usar feature paga.** Ao tentar adicionar 6º produto, ou tentar editar cor da vitrine, modal com upsell focado naquele benefício.
3. **30 dias após cadastro.** E-mail destacando vitrines de sucesso (estudos de caso) e oferta especial de primeiro mês.
4. **Após 100 visualizações na vitrine.** Push de PWA (quando disponível): "Sua vitrine teve 100 visitas! Veja quem está acessando com o plano Pro."

### 5.2 Cupons promocionais

| Cupom | Efeito | Uso recomendado |
|---|---|---|
| `PRIMEIRA50` | 50% off na primeira mensalidade | Lançamento, embaixadoras, eventos |
| `ANUAL30` | 30% off no plano anual | Black Friday, datas comemorativas |
| `INDICACAO` | 1 mês grátis (uso interno) | Programa de indicação |

Cupons têm validade configurável e limite de uso global e por usuária. Implementação via tabela `coupons` e `coupon_redemptions`.

### 5.3 Programa de indicação

Quando uma usuária Pro+ indica uma amiga que assina Pro+:
- Quem indica: 1 mês grátis aplicado na próxima fatura
- Quem é indicada: 30 dias de Pro grátis (em vez de plano Free)

Por que isso funciona neste nicho: revendedoras de venda direta vivem de indicação. É a língua nativa delas.

## 6. Política de cancelamento e reembolso

### 6.1 Cancelamento

- **Self-service:** botão claro em "Meu plano". Sem necessidade de falar com suporte.
- **Efeito imediato vs. fim do período:** padrão é continuar até o fim do período já pago, depois cair para Free. Sem proporcionalidade ou reembolso parcial.
- **Pesquisa de saída opcional:** modal não-bloqueante perguntando o motivo (preço, falta de uso, mudou de ideia, outro).

### 6.2 Reembolso

- **Garantia de 7 dias na primeira assinatura paga.** Atendendo ao Código de Defesa do Consumidor (arrependimento). Reembolso integral sem perguntas.
- **Após 7 dias:** sem reembolso por padrão. Casos excepcionais (cobrança duplicada, erro técnico) tratados pelo suporte.

### 6.3 Inadimplência

| Dias após vencimento | Ação |
|---|---|
| 0 | Tenta cobrança automática (cartão) |
| 1 | E-mail "atualizar dados de pagamento" |
| 3 | E-mail mais firme + push notification |
| 7 | Conta marcada como `past_due`, mas vitrine continua ativa (graça) |
| 14 | Vitrine pública mantém as 5 produtos primeiros (volta ao limite Free) |
| 30 | Plano oficialmente cai para Free, dados preservados |

Importante: nunca apagamos dados de produtos por inadimplência. Apenas escondemos o excedente. Se a usuária volta, recupera tudo.

## 7. Notas fiscais

### 7.1 Obrigatoriedade

Como SaaS, emitimos **NFS-e (Nota Fiscal de Serviço Eletrônica)**. Obrigatório no Brasil.

### 7.2 Operação

Para o MVP, opções:
- **Asaas com módulo de NF-e integrado** (mais simples, custo adicional)
- **Integração com NFE.io ou Webmania** (NF-e como serviço, R$ 30-100/mês)
- **Emissão manual** (apenas viável se < 30 NFs/mês — dolorido depois)

Recomendação para o MVP: começar com NFE.io ou módulo do Asaas, automatizar via webhook (toda fatura paga gera NF-e em 24h).

### 7.3 Regime tributário

Empresa começa muito provavelmente como **MEI** (até R$ 81k/ano), depois migra para **Simples Nacional** (até R$ 4,8M/ano). Atividade SaaS no Simples cai no Anexo III ou V dependendo do Fator R. Recomendação: contratar contador desde o início (R$ 200-500/mês) — não é lugar para improviso.

## 8. Quando ajustar preços

### 8.1 Sinais para subir

- Conversão > 12% consistentemente (preço pode estar baixo para o valor)
- Churn baixo (< 3%) mesmo após primeiro mês (alto valor percebido)
- Pesquisas qualitativas indicando que usuárias acham "barato"
- Custos de infraestrutura crescendo proporcionalmente à base

### 8.2 Sinais para descer

- Abandono no checkout > 50% (preço como barreira)
- Comparação com concorrentes desfavorável após eles ajustarem
- Conversão estagnada e e-mails respondendo "está caro"

### 8.3 Como ajustar

- Novos preços só se aplicam a novos cadastros
- Usuárias existentes mantêm preço de quando assinaram (grandfathering) por pelo menos 12 meses
- Comunicação clara: e-mail explicando o porquê, antecedência mínima de 30 dias

## 9. Receita não-assinatura (futuras)

Possibilidades exploráveis após PMF, fora do MVP:

- **Marketplace de templates** premium para vitrines (R$ 9-29 por template)
- **Cursos e conteúdo** de "como vender mais" (assinatura à parte ou bundle)
- **Comissão sobre vendas** se evoluir para gateway integrado (probabilidade baixa, complica modelo)
- **Anúncios pagos dentro da plataforma** para revendedoras se destacarem em vitrines de descoberta (apenas se virmos volume real de cliente final)

Decisão estratégica: foco total em assinatura no MVP e primeiros 12 meses. Diversificação só com base instalada > 10k usuárias pagas.
