# DESIGN — Identidade Visual, Design System e UX

## 1. Princípios de design

### 1.1 Mobile-first sem desculpas

A revendedora cadastra produtos no celular, no intervalo do almoço, com a câmera aberta. O painel precisa funcionar bem com um polegar só. Toda decisão de layout começa pelo viewport de 360px. Desktop é uma camada de evolução que aproveita o espaço extra, nunca o contrário.

### 1.2 Densidade baixa

O público inclui pessoas com pouca familiaridade técnica. Telas com muitos elementos competindo confundem. Preferimos **uma ação primária por tela**, áreas de toque generosas (mínimo 44px), e bastante respiro.

### 1.3 Linguagem que conversa

Sem jargão. "Cadastre um produto" e não "Adicionar item ao catálogo". "Sua vitrine" e não "URL pública". O tom é o de uma amiga organizada explicando algo, não o de um software corporativo.

### 1.4 Visual que profissionaliza

A revendedora paga pelo serviço justamente porque quer parecer mais profissional. A vitrine pública precisa parecer cuidada, mesmo quando ela ainda nem entende muito do app. Defaults bonitos vencem customização.

### 1.5 Velocidade percebida importa mais que velocidade absoluta

Loading states bem feitos, transições suaves, optimistic UI no painel. Nada congelado.

## 2. Identidade visual

### 2.1 Paleta de cores

A paleta foi pensada para parecer feminina sem cair no rosa óbvio, profissional sem parecer corporativa, e quente sem ser cansativa.

| Token                  | Hex       | Uso                                              |
| ---------------------- | --------- | ------------------------------------------------ |
| `--brand-primary`      | `#7C3AED` | Roxo violeta — botões primários, links, destaque |
| `--brand-primary-dark` | `#6D28D9` | Hover/active do primário                         |
| `--brand-secondary`    | `#EC4899` | Rosa magenta — acentos, badges promocionais      |
| `--brand-accent`       | `#F59E0B` | Âmbar — alertas, destaques de promoção           |
| `--neutral-900`        | `#111827` | Texto principal                                  |
| `--neutral-700`        | `#374151` | Texto secundário                                 |
| `--neutral-500`        | `#6B7280` | Texto desbotado, placeholders                    |
| `--neutral-200`        | `#E5E7EB` | Bordas, divisores                                |
| `--neutral-100`        | `#F3F4F6` | Fundos secundários                               |
| `--neutral-50`         | `#F9FAFB` | Fundo principal                                  |
| `--success`            | `#10B981` | Confirmações, "produto disponível"               |
| `--warning`            | `#F59E0B` | Alertas suaves                                   |
| `--danger`             | `#EF4444` | Erros, exclusão                                  |
| `--whatsapp`           | `#25D366` | Cor oficial do WhatsApp para o botão de pedido   |

Modo escuro inverte as neutras e mantém as marcas com saturação 5% maior para compensar o fundo escuro.

### 2.2 Tipografia

| Token            | Família           | Pesos              | Uso                              |
| ---------------- | ----------------- | ------------------ | -------------------------------- |
| `--font-sans`    | Inter             | 400, 500, 600, 700 | Interface geral                  |
| `--font-display` | Plus Jakarta Sans | 600, 700, 800      | Títulos grandes, hero da vitrine |

Inter é gratuita, neutra, otimizada para tela e tem ótimo suporte a português. Plus Jakarta dá um toque de personalidade nos títulos sem ficar carregada. Ambas via Google Fonts ou self-hosted via `next/font`.

Escala (mobile-first):

| Token       | Tamanho | Line-height | Uso                           |
| ----------- | ------- | ----------- | ----------------------------- |
| `text-xs`   | 12px    | 1.4         | Legendas, metadados           |
| `text-sm`   | 14px    | 1.5         | Texto auxiliar                |
| `text-base` | 16px    | 1.5         | Texto padrão                  |
| `text-lg`   | 18px    | 1.4         | Subtítulos                    |
| `text-xl`   | 22px    | 1.3         | Títulos de seção              |
| `text-2xl`  | 28px    | 1.2         | Títulos de tela               |
| `text-3xl`  | 34px    | 1.1         | Hero (apenas vitrine pública) |

### 2.3 Espaçamento

Sistema base 4px. Tokens: `1` (4px), `2` (8px), `3` (12px), `4` (16px), `5` (20px), `6` (24px), `8` (32px), `10` (40px), `12` (48px), `16` (64px).

Padding mínimo lateral em mobile: 16px. Em desktop: container de 1200px com padding 32px.

### 2.4 Bordas e sombras

| Token         | Valor                              |
| ------------- | ---------------------------------- |
| `--radius-sm` | 6px (inputs, badges)               |
| `--radius-md` | 10px (botões, cards)               |
| `--radius-lg` | 16px (modals, contêineres maiores) |
| `--radius-xl` | 24px (hero da vitrine)             |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.04)`       |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.08)`      |
| `--shadow-lg` | `0 12px 32px rgba(0,0,0,0.12)`     |

### 2.5 Iconografia

Lucide Icons (já vem com shadcn/ui). Tamanho padrão 20px no painel, 24px na vitrine pública. Stroke width 2 sempre.

### 2.6 Imagens dos produtos

Aspect ratio padrão: 1:1 (quadrado). É o formato que melhor se adapta ao Instagram e que combina mais marcas. Imagem de produto sem fundo é incentivada (com tutorial de como remover fundo via Photoroom, app gratuito).

Placeholder quando não há foto: ilustração SVG amigável com texto "Foto em breve" — nunca um placeholder técnico tipo "image not found".

## 3. Componentes (design system)

A base é o **shadcn/ui**, customizado com nossos tokens. Lista de componentes essenciais para o MVP:

### Componentes primitivos

- Button (primary, secondary, ghost, danger, whatsapp)
- Input, Textarea, Select
- Checkbox, Switch
- Avatar
- Badge
- Card
- Dialog (modal)
- Sheet (drawer mobile)
- Toast (notificações)
- Skeleton (loading)
- Tabs

### Componentes compostos do produto

- ProductCard (card de produto na vitrine)
- ProductForm (formulário de cadastro/edição)
- ImageUploader (upload com preview e crop)
- WhatsAppButton (botão verde com ícone, mensagem pré-formatada)
- VitrineHeader (cabeçalho da vitrine pública)
- StatCard (métrica no painel)
- EmptyState (ilustração + texto + CTA)
- PlanComparisonTable (tabela de planos)
- MobileBottomNav (navegação inferior do painel mobile)

## 4. Padrões de UX

### 4.1 Onboarding

Primeiro acesso após cadastro segue 4 passos curtos, com possibilidade de pular:

1. **Seu nome** — usado na vitrine ("Vitrine de Maria")
2. **Seu @** — slug da URL, com sugestões automáticas baseadas no nome
3. **Seu WhatsApp** — com validação por SMS (DDD + 9 dígitos)
4. **Foto de perfil** — opcional, com sugestão de pular se não tiver agora

Após os 4 passos, cai direto na tela "Cadastre seu primeiro produto" com botão grande no centro. Sem dashboard vazio assustando.

### 4.2 Navegação principal (mobile)

Bottom navigation com 4 ícones:

1. **Vitrine** — preview da vitrine pública
2. **Produtos** — lista, busca, cadastro
3. **Pedidos** — feed de cliques de pedido (intenções de compra)
4. **Conta** — perfil, plano, configurações, suporte

### 4.3 Padrões de formulário

- Labels sempre acima do campo (nunca placeholder como label)
- Erros aparecem abaixo do campo, em vermelho, com ícone
- Validação visual em tempo real para campos críticos (slug, WhatsApp)
- Botão de submit fixo no rodapé em mobile, dentro do form em desktop
- Auto-save em rascunho de produto a cada 5 segundos

### 4.4 Padrões de feedback

| Tipo de evento                   | Componente                                  | Duração       |
| -------------------------------- | ------------------------------------------- | ------------- |
| Sucesso (salvo, copiado)         | Toast verde, topo                           | 2.5s          |
| Erro de rede                     | Toast vermelho com botão "Tentar novamente" | 5s            |
| Confirmação destrutiva (excluir) | Dialog modal                                | até confirmar |
| Loading curto (<1s)              | Spinner inline                              | até completar |
| Loading longo (>1s)              | Skeleton da estrutura final                 | até completar |

### 4.5 Imagens e performance

- Upload com compressão no cliente antes de enviar (browser-image-compression)
- Imagens originais armazenadas; servidas via CDN (Supabase Storage + Image Transform)
- Formato webp na entrega
- Lazy loading nativo (`loading="lazy"`)
- Imagem do hero da vitrine é eager (carrega primeiro)

## 5. Fluxos principais

### 5.1 Fluxo de cadastro de produto

```
[Painel] → [Botão "Adicionar produto"] → [Form abre como Sheet/modal]
  ↓
[Tirar/escolher foto] → [Compressão local] → [Preview com crop quadrado]
  ↓
[Preencher: nome, preço, descrição, categoria, marca]
  ↓
[Salvar] → [Toast verde "Produto adicionado"] → [Volta à lista, novo produto no topo]
```

Tempo-alvo: 90 segundos do clique em "adicionar" ao produto salvo.

### 5.2 Fluxo do cliente final na vitrine

```
[Cliente recebe link no WhatsApp] → [Abre vitri.app/maria-silva]
  ↓
[Vê foto, nome, bio da Maria + grid de produtos]
  ↓
[Toca em produto] → [Modal com fotos, descrição, preço]
  ↓
[Toca em "Pedir no WhatsApp"]
  ↓ (registra intent no banco)
  ↓
[Abre WhatsApp com mensagem: "Olá Maria, tenho interesse: Batom Avon Tom 234 — R$ 32,90. Vitrine: vitri.app/maria-silva"]
```

Tempo-alvo do cliente: 15 segundos da abertura do link ao WhatsApp aberto.

### 5.3 Fluxo de upgrade Free → Pro

```
[Usuária no Free tenta cadastrar 6º produto]
  ↓
[Modal: "Você atingiu o limite do plano Free. Quer ver os benefícios do Pro?"]
  ↓
[Tela de comparação Free vs Pro vs Plus, com Pro destacado]
  ↓
[Botão "Assinar Pro - R$ 39/mês"] → [Checkout Asaas embedded]
  ↓
[PIX (com QR Code) ou cartão]
  ↓
[Confirmação de pagamento via webhook]
  ↓
[Toast "Bem-vinda ao Pro!" + tour rápido das novidades]
```

## 6. Acessibilidade

- Contraste mínimo AA em todo texto (4.5:1 para texto normal, 3:1 para grande)
- Foco visível em todos os elementos interativos (outline customizado, nunca remover sem substituir)
- Todas as imagens com alt text obrigatório no cadastro de produto
- Todos os ícones-botão com aria-label
- Navegação completa via teclado no painel desktop
- Suporte a `prefers-reduced-motion` desabilitando animações

## 7. Internacionalização (preparação)

MVP é exclusivo em **pt-BR**, mas a estrutura de strings deve estar pronta para i18n desde o início. Usar `next-intl` ou similar e separar todas as strings da interface em um arquivo `messages/pt-BR.json`. Isso facilita expansão futura para outros mercados latino-americanos (Argentina, México) sem refazer.

## 8. Wireframes e protótipos

Recomendação: criar protótipo navegável em **Figma** antes de codar, com pelo menos as seguintes telas:

1. Onboarding (4 telas)
2. Lista de produtos (vazia, com 1 produto, com 10 produtos)
3. Formulário de cadastro de produto
4. Vitrine pública (mobile e desktop)
5. Modal do produto na vitrine
6. Painel de estatísticas
7. Comparação de planos e checkout
8. Tela de conta e configurações

O protótipo é validado com 3-5 revendedoras em entrevista guiada antes do desenvolvimento começar.
