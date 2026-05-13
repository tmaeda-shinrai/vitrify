# FEATURES — Funcionalidades

Este documento detalha todas as funcionalidades do produto, organizadas por área, com priorização MoSCoW (Must, Should, Could, Won't) e divisão entre planos.

## Legenda

- **Must** — obrigatório no MVP
- **Should** — desejável no MVP, aceitável adiar para v1.1
- **Could** — agradável de ter, fica para v2
- **Won't** — explicitamente fora do escopo agora

## 1. Autenticação e conta

| Feature | Prioridade | Plano | Notas |
|---|---|---|---|
| Cadastro com e-mail e senha | Must | Todos | Confirmação por e-mail obrigatória |
| Login com Google (OAuth) | Must | Todos | Reduz fricção do cadastro |
| Recuperação de senha | Must | Todos | Link mágico expirando em 1h |
| Edição de perfil (nome, foto, bio, WhatsApp) | Must | Todos | Foto entra em compressão (ver upload) |
| Exclusão de conta (LGPD) | Must | Todos | Anonimização em 30 dias após pedido |
| Autenticação de dois fatores | Could | Todos | v2 |
| Login social (Facebook, Apple) | Could | Todos | v2, Apple obrigatório se virar app nativo |

## 2. Vitrine pública

| Feature | Prioridade | Plano | Notas |
|---|---|---|---|
| URL personalizada (slug) | Must | Todos | `vitrinio.com.br/maria-silva`. Validar disponibilidade no cadastro |
| Cabeçalho com foto + nome + bio + WhatsApp | Must | Todos | Bio com 160 caracteres |
| Lista de produtos em grid responsivo | Must | Todos | 2 colunas mobile, 3-4 colunas desktop |
| Filtro por categoria | Must | Todos | Categorias livres, criadas pelo usuário |
| Filtro por marca | Must | Todos | Marcas livres, sugestão das mais comuns |
| Busca por texto no produto | Should | Todos | Indexar nome e descrição |
| Botão "Pedir no WhatsApp" em cada produto | Must | Todos | Mensagem pré-formatada com nome + preço |
| Botão WhatsApp flutuante geral | Must | Todos | Para dúvidas sem produto específico |
| Compartilhamento via Web Share API | Should | Todos | "Compartilhar minha vitrine" |
| Tema claro/escuro automático | Should | Todos | Respeita preferência do navegador |
| Personalização de cores | Could | Pro+ | Paleta limitada no MVP, picker livre depois |
| Domínio próprio (`maria.com.br`) | Could | Plus | v2 |
| Vitrine privada com senha | Won't | — | Decisão: não fazemos isso |

## 3. Gestão de produtos

| Feature | Prioridade | Plano | Notas |
|---|---|---|---|
| Cadastro com foto, nome, preço, descrição | Must | Todos | Limite de 5 produtos no Free, ilimitado no Pro+ |
| Múltiplas fotos por produto (até 5) | Must | Todos | Carrossel na vitrine |
| Categorias customizáveis | Must | Todos | Ex: "Maquiagem", "Perfumes", "Linha Mãe e Bebê" |
| Marca como atributo | Must | Todos | Sugestões pré-cadastradas + entrada livre |
| Preço promocional (de/por) | Must | Todos | Riscado na vitrine |
| Marcação de "esgotado" | Must | Todos | Produto fica visível mas botão desabilitado |
| Ordenação manual (drag-and-drop) | Should | Todos | Para destacar lançamentos |
| Duplicar produto | Should | Todos | Acelera cadastro de variações |
| Importação em lote via CSV | Could | Pro+ | v1.1 |
| Vídeo no produto (até 60s) | Should | Plus | Diferencial do plano Plus |
| Variantes (tamanho, cor) | Could | Pro+ | v2 |
| Estoque numérico | Won't | — | Nunca: revendedor não controla estoque assim |

## 4. Pedidos e analytics

| Feature | Prioridade | Plano | Notas |
|---|---|---|---|
| Registro de "intenção de pedido" no clique do botão | Must | Todos | Captura antes de redirecionar para WhatsApp |
| Painel de visualizações da vitrine | Must | Todos | Total + últimos 7 dias + últimos 30 dias |
| Cliques por produto | Must | Todos | Identifica produtos mais procurados |
| Origem do tráfego (referrer) | Should | Pro+ | Instagram, WhatsApp, link direto, etc. |
| Gráfico temporal de visitas | Should | Pro+ | Pequenos gráficos no painel |
| Exportação de relatórios em CSV | Could | Plus | v1.1 |
| Notificações push de novos cliques | Could | Pro+ | v2, depende de PWA estar bem rodada |

## 5. PWA (Progressive Web App)

| Feature | Prioridade | Plano | Notas |
|---|---|---|---|
| Manifest e service worker básico | Must | Todos | Instalável em iOS e Android |
| Cache offline da vitrine pública (somente leitura) | Should | Todos | Cliente vê vitrine mesmo sem internet |
| Cache do painel da vendedora | Should | Todos | Mostra última versão sincronizada |
| Notificações push web | Could | Pro+ | v2 |
| Compartilhamento via OS Share Sheet | Should | Todos | Web Share API |
| Atalhos no app (shortcuts) | Could | Todos | "Adicionar produto", "Ver vitrine" |

## 6. Pagamento e assinatura

| Feature | Prioridade | Plano | Notas |
|---|---|---|---|
| Plano Free funcionando sem cartão | Must | Free | Apenas e-mail confirmado |
| Cobrança recorrente via PIX | Must | Pro, Plus | Asaas como gateway preferencial |
| Cobrança recorrente via cartão | Must | Pro, Plus | Backup ao PIX |
| Boleto recorrente | Should | Pro, Plus | Comum no público |
| Página de upgrade com comparação | Must | Free | Mostra exatamente o que muda |
| Aviso quando atinge limite do Free | Must | Free | "Você tem 5 de 5 produtos. Para mais, faça upgrade." |
| Cancelamento self-service | Must | Pro, Plus | Sem precisar falar com suporte |
| Histórico de faturas | Must | Pro, Plus | Download em PDF |
| Cupons promocionais | Should | Pro, Plus | "PRIMEIRA50" desconto na primeira mensalidade |
| Pagamento anual com desconto | Should | Pro, Plus | 20% de desconto |
| Programa de indicação ("traga uma amiga") | Should | Pro, Plus | 1 mês grátis por indicação convertida |

## 7. Suporte e comunicação

| Feature | Prioridade | Plano | Notas |
|---|---|---|---|
| FAQ com busca | Must | Todos | Mínimo 20 perguntas no lançamento |
| Tutorial em vídeo curto (60s) | Must | Todos | Embutido no primeiro acesso |
| Chat de suporte via WhatsApp | Must | Todos | Atendimento humano nos 3 primeiros meses |
| Tour guiado dentro do app | Should | Todos | Primeiro acesso |
| Central de ajuda completa | Should | Todos | v1.1 |
| Suporte prioritário | Could | Plus | Diferencial do Plus |

## 8. Administração interna (não exposta ao usuário)

| Feature | Prioridade | Notas |
|---|---|---|
| Painel admin para visualizar contas | Must | Necessário para suporte |
| Bloqueio manual de conta | Must | Caso de denúncia DMCA, abuso |
| Logs de auditoria | Must | Quem fez o que e quando |
| Métricas de produto agregadas | Must | DAU, MAU, conversão por funil |
| Health check de serviços | Must | Status do banco, gateway, e-mail |
| Sistema de denúncia de vitrine | Must | Botão "denunciar" na vitrine pública |

## Divisão por plano (resumo)

| Recurso | Free | Pro (R$ 39/mês) | Plus (R$ 69/mês) |
|---|:---:|:---:|:---:|
| Vitrine pública | ✓ | ✓ | ✓ |
| Slug personalizado | ✓ | ✓ | ✓ |
| Botão WhatsApp | ✓ | ✓ | ✓ |
| Limite de produtos | 5 | Ilimitado | Ilimitado |
| Múltiplas fotos por produto | ✓ | ✓ | ✓ |
| Categorias e filtros | ✓ | ✓ | ✓ |
| Estatísticas básicas | ✓ | ✓ | ✓ |
| Origem do tráfego | — | ✓ | ✓ |
| Personalização de cores | — | ✓ | ✓ |
| Vídeo nos produtos | — | — | ✓ |
| Múltiplas vitrines | — | — | ✓ (até 3) |
| Domínio próprio | — | — | ✓ |
| Suporte prioritário | — | — | ✓ |
| Exportar relatórios | — | — | ✓ |

## Critérios de aceitação por feature

Cada feature implementada deve passar pelos seguintes critérios genéricos antes de ir para produção:

1. Funciona em iOS Safari, Android Chrome e Desktop Chrome/Firefox
2. Tem ao menos um teste automatizado cobrindo o caminho feliz
3. Tem comportamento definido para erro (network falhou, dado inválido, etc.)
4. Texto em português brasileiro, sem termos técnicos desnecessários
5. Acessibilidade básica (contraste, foco visível, labels)
6. Loading state visível em ações de mais de 300ms
