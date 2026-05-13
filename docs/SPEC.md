# SPEC — Especificação do Produto

## 1. Problema

O revendedor autônomo brasileiro que trabalha com múltiplas marcas (Avon, Natura, Hinode, Mary Kay, Tupperware, Eudora) enfrenta três fricções:

1. **Catálogos fragmentados.** Cada marca oferece sua própria ferramenta oficial, mas todas são exclusivas para o portfólio daquela marca. Quem vende quatro marcas precisa enviar quatro links diferentes ao cliente.
2. **WhatsApp como vitrine improvisada.** Mensagens com fotos soltas, listas de preço em PDF, áudios explicando produtos — tudo isso é confuso para o cliente e cansativo para o vendedor.
3. **Soluções existentes mal calibradas.** Ferramentas tipo Kyte foram pensadas para pequenos lojistas com PDV completo. Vendizap é mais próximo, mas com preço fora do orçamento de uma revendedora de menor volume.

## 2. Solução

Uma plataforma SaaS onde a revendedora cadastra produtos de qualquer marca, organiza por categorias e gera **um único link público** (`vitrinio.com.br/maria-silva`) que pode ser colocado na bio do Instagram, no status do WhatsApp ou enviado direto para o cliente.

A vitrine pública mostra os produtos com foto, nome, preço e um botão **"Pedir no WhatsApp"** que abre uma conversa com mensagem pré-formatada para a vendedora ("Olá Maria, tenho interesse no produto: Batom Avon Tom 234 — R$ 32,90").

A finalização da venda (negociação, pagamento, entrega) acontece no WhatsApp — onde a revendedora já está confortável e onde o cliente já compra hoje.

## 3. Princípios de produto

Estes princípios guiam toda decisão de feature, design e prioridade. Quando duas opções competem, vence a que mais respeita estes princípios.

1. **Simplicidade radical.** A revendedora deve conseguir criar a vitrine e cadastrar 5 produtos em menos de 10 minutos, no celular, sem tutorial.
2. **Mobile-first, sempre.** O painel de controle e a vitrine pública são pensados primeiro para o celular. Desktop é evolução, não ponto de partida.
3. **WhatsApp é o destino, não o concorrente.** Não tentamos substituir o WhatsApp. Levamos o cliente até ele.
4. **Preço alinhado à realidade.** Plano de entrada acessível para revendedoras de menor volume; plano superior para quem fatura mais e precisa de recursos profissionais.
5. **Independência de marca.** A plataforma é agnóstica. Não fazemos parceria que crie privilégios para uma marca específica em detrimento de outra.

## 4. Personas

### Persona primária — Mariana, 38 anos, revendedora multimarcas

Vende Avon há 6 anos, agregou Natura há 2 anos e começou com Hinode no último ano. Trabalha em casa, atende cerca de 80 clientes recorrentes. Tem ensino superior incompleto, é fluente em WhatsApp e Instagram, mas considera "computador" algo distante. Frustração principal: enviar listas de preço atualizadas para clientes toda semana é cansativo. Disposição a pagar: até R$ 50/mês por algo que economize tempo e a faça parecer mais profissional.

### Persona secundária — Carla, 26 anos, revendedora iniciante

Acaba de começar como consultora Natura, ainda sem clientela formada. Estudou marketing digital pelo TikTok e quer "fazer bonito" desde o início. Frustração principal: não tem clientes ainda e precisa parecer profissional para conquistar os primeiros. Disposição a pagar: muito sensível a preço inicialmente, mas evolui rápido se ver retorno.

### Persona terciária — Joana, 52 anos, revendedora veterana

Revende Avon há mais de 20 anos, tem clientela fiel e fatura bem. Tem dificuldade com tecnologia, prefere mensagens de texto a aplicativos. Frustração principal: vê as concorrentes mais jovens "modernizando" o atendimento e sente que está ficando para trás. Disposição a pagar: alta, desde que seja muito fácil de usar.

## 5. Métricas de sucesso

### Métricas de produto (North Star)

A North Star é **vitrines ativas com pelo menos um clique de pedido nos últimos 30 dias**. Mede simultaneamente engajamento da vendedora (manteve a vitrine viva) e do consumidor final (gerou intenção de compra).

### Métricas operacionais

| Métrica | Meta MVP (mês 6) | Cálculo |
|---|---|---|
| Usuárias cadastradas | 1.500 | Total de contas criadas |
| Vitrines com 5+ produtos | 600 | Filtro pelo banco |
| Conversão Free → Pro | 8% | Pagas / Total |
| Churn mensal Pro+ | < 6% | Cancelamentos / Base do mês |
| LTV / CAC | ≥ 3 | LTV médio dividido pelo custo de aquisição |
| NPS | ≥ 50 | Survey trimestral |

### Métricas técnicas

Tempo de carregamento da vitrine pública abaixo de 2 segundos no 3G simulado. Disponibilidade mensal acima de 99,5% no MVP. Score Lighthouse mobile acima de 90 em performance e acessibilidade.

## 6. Escopo do MVP

**Dentro do escopo:**

- Cadastro e autenticação (e-mail/senha + Google)
- Criação de vitrine pública com URL personalizada (slug)
- CRUD de produtos com foto, nome, preço, descrição, categoria e marca
- Botão "Pedir no WhatsApp" com mensagem pré-formatada
- Painel da vendedora com estatísticas básicas (visualizações, cliques)
- Plano Free com 5 produtos e plano Pro com produtos ilimitados
- Cobrança recorrente via PIX/cartão (Asaas)
- PWA instalável

**Fora do escopo no MVP (vai para v2 ou depois):**

- Vídeos nos produtos (recurso do plano Plus)
- Múltiplas vitrines por conta
- Carrinho de compras dentro da plataforma
- Integração direta com gateways das marcas (Avon API etc.)
- App nativo iOS/Android
- Marketplace ou descoberta entre vitrines
- Sistema de cupons e promoções
- Programa de afiliados com painel completo (versão simples no MVP, completa depois)

## 7. Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Marcas (Avon, Natura) acionarem por uso de imagens | Baixa no início, sobe com escala | Alto | Cláusula de responsabilidade do usuário, sistema de denúncia, parcerias futuras (ver LEGAL.md) |
| Concorrentes (Vendizap) baixarem preço para reagir | Média | Médio | Diferenciação por nicho multimarcas e UX superior, não por preço |
| LGPD: vazamento ou notificação ANPD | Baixa com boas práticas | Alto | Hosting Brasil, política clara, criptografia, auditoria trimestral (ver LEGAL.md) |
| Custo de aquisição maior que LTV | Média no início | Alto | Foco em canais orgânicos antes de pagos (ver GTM.md) |
| Adoção lenta por desconforto técnico do público | Média | Alto | Onboarding guiado, vídeos curtos, suporte humano via WhatsApp nos 3 primeiros meses |
| Dependência de fornecedor único (Supabase) | Baixa | Médio | Schema padrão Postgres, dados exportáveis, possibilidade de migração futura |

## 8. Critérios de pronto do MVP

O MVP é considerado pronto para lançamento quando:

1. Todas as funcionalidades listadas como dentro do escopo estão implementadas e testadas
2. 10 usuárias-piloto (embaixadoras) usaram o produto por pelo menos 2 semanas e validaram o fluxo
3. Política de privacidade, termos de uso e processo de exclusão de conta estão publicados
4. Pagamento recorrente foi testado em produção com pelo menos 5 transações reais
5. Score Lighthouse mobile da vitrine pública acima de 90
6. Backup automático do banco configurado e testado (restore em ambiente isolado)
7. Documentação de suporte básica publicada (FAQ + 5 tutoriais em vídeo curto)
