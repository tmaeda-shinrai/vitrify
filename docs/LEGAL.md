# LEGAL — Conformidade, LGPD e Propriedade Intelectual

> Este documento orienta as decisões legais e operacionais do projeto. Não substitui orientação jurídica profissional. Antes do lançamento público, **um advogado especializado em direito digital deve revisar** os termos de uso, política de privacidade e contratos.

## 1. LGPD — Lei Geral de Proteção de Dados

### 1.1 Por que é crítico

A LGPD aplica-se a qualquer empresa que trate dados pessoais de pessoas no Brasil. Multas podem chegar a 2% do faturamento (limitado a R$ 50 milhões). Para um SaaS pequeno, descuido aqui é evitável e potencialmente fatal.

### 1.2 Bases legais aplicáveis

A plataforma trata dados pessoais sob as seguintes bases legais (Art. 7º LGPD):

- **Execução de contrato:** dados necessários para prestar o serviço (e-mail, WhatsApp, foto, slug)
- **Consentimento:** comunicações de marketing, cookies analíticos não-essenciais
- **Legítimo interesse:** logs de segurança, prevenção a fraude
- **Cumprimento de obrigação legal:** dados fiscais e contábeis (NF-e)

### 1.3 Dados pessoais coletados

| Dado                   | Quando            | Base legal         | Compartilhado                                          |
| ---------------------- | ----------------- | ------------------ | ------------------------------------------------------ |
| E-mail                 | Cadastro          | Contrato           | Resend (envio)                                         |
| Nome                   | Cadastro          | Contrato           | —                                                      |
| Senha (hash)           | Cadastro          | Contrato           | Supabase Auth                                          |
| Foto de perfil         | Onboarding        | Contrato           | Supabase Storage                                       |
| WhatsApp               | Onboarding        | Contrato           | — (visível na vitrine pública por intenção da usuária) |
| Bio                    | Onboarding        | Contrato           | — (público)                                            |
| IP (hash)              | Visitas e intents | Legítimo interesse | —                                                      |
| Dados de pagamento     | Checkout          | Contrato           | Asaas (processamento)                                  |
| CPF/CNPJ (faturamento) | Checkout          | Obrigação legal    | Asaas, contador                                        |

### 1.4 Direitos do titular

A plataforma garante todos os direitos do Art. 18 LGPD:

| Direito                                         | Implementação                                         |
| ----------------------------------------------- | ----------------------------------------------------- |
| Confirmação e acesso                            | Tela "Meus dados" com export em JSON                  |
| Correção                                        | Edição direta no perfil                               |
| Anonimização ou eliminação                      | Botão "Excluir minha conta" — anonimização em 30 dias |
| Portabilidade                                   | Export de produtos e dados pessoais em CSV/JSON       |
| Eliminação dos dados tratados com consentimento | Aceite revogável a qualquer momento                   |
| Informação sobre compartilhamento               | Política de privacidade lista todos os terceiros      |
| Revogação do consentimento                      | Disponível em "Configurações > Privacidade"           |

### 1.5 Política de retenção

| Dado                        | Tempo de retenção                                     | Justificativa                         |
| --------------------------- | ----------------------------------------------------- | ------------------------------------- |
| Conta ativa                 | Enquanto a conta estiver ativa                        | Execução de contrato                  |
| Conta excluída              | Anonimização em 30 dias, exclusão completa em 90 dias | Direito de arrependimento + segurança |
| Logs de auditoria           | 180 dias                                              | Legítimo interesse (segurança)        |
| Dados fiscais (NF-e)        | 5 anos                                                | Obrigação legal (tributária)          |
| Backups                     | 90 dias (rotativo)                                    | Continuidade do serviço               |
| Hash de IP em order_intents | 12 meses                                              | Analytics agregada para a vendedora   |

### 1.6 Encarregado de Proteção de Dados (DPO)

Empresas pequenas podem nomear o próprio sócio ou contratar DPO terceirizado. Para o MVP, o sócio assume a função, com e-mail dedicado: `dpo@vitri.app` (ou domínio escolhido).

### 1.7 Resposta a incidentes

Plano de resposta documentado em `docs/security-incidents.md` (a criar). Em caso de vazamento:

1. Conter: revogar credenciais, isolar sistema afetado
2. Avaliar: escopo, dados afetados, número de titulares
3. Notificar: ANPD em até 2 dias úteis e titulares afetados
4. Documentar: relatório detalhado para auditoria
5. Corrigir: causa raiz e medidas preventivas

### 1.8 Hosting e transferência internacional

- Banco e Storage: Supabase região **South America (São Paulo)**
- Vercel: edge global, mas **sem armazenar dados pessoais** (apenas roteamento)
- Resend: dados de e-mail processados nos EUA — disclosure em política de privacidade
- Asaas: nacional
- Sentry: configurado para **anonimizar PII** (e-mail, WhatsApp, nome) antes de enviar

Transferência internacional para EUA (Resend, Sentry) está coberta pela LGPD via cláusulas contratuais e pela natureza do serviço (e-mail e error tracking são serviços comuns e bem regulados).

## 2. Direito de imagem e propriedade intelectual dos produtos

### 2.1 O problema

Revendedoras usam fotos oficiais das marcas (Avon, Natura, Hinode) que são **protegidas por direito autoral e marcas registradas**. Tecnicamente, sem autorização específica, não há licença para reproduzir essas imagens em uma plataforma de terceiros para uso comercial.

Na prática:

- As marcas raramente acionam revendedores individuais (revendedora é parceira comercial, mesmo que indireta)
- Mas se a plataforma cresce, ela mesma vira alvo potencial de notificação extrajudicial ou judicial

### 2.2 Mitigação em camadas

**Camada 1 — Termos de Uso:**
Cláusula clara transferindo a responsabilidade de licenciamento para a usuária. Modelo:

> "Ao cadastrar produtos na plataforma, a Usuária declara possuir os direitos necessários sobre as imagens, descrições e marcas reproduzidas, ou estar autorizada a usá-las. A Usuária é integralmente responsável por qualquer reclamação de terceiros referente ao conteúdo cadastrado, isentando a Plataforma de responsabilidade nessa esfera."

**Camada 2 — Sistema de denúncia (DMCA-like):**
Botão "Denunciar" na vitrine pública e e-mail dedicado `direitos@vitrinio.com.br`. Notificações de violação são respondidas em até 48h, com remoção do conteúdo enquanto a investigação acontece.

**Camada 3 — Notificação proativa às marcas (se relevante):**
Quando a plataforma atingir base relevante (ex: 5.000 usuárias), buscar contato com departamentos jurídicos das maiores marcas para validar tacitamente o uso. Em alguns casos pode evoluir para parceria oficial (API direta de produtos).

**Camada 4 — Política de uso aceitável:**
Comunicar à usuária no onboarding boas práticas: usar fotos em contexto de revenda, não fazer publicidade enganosa, não posar como funcionária oficial da marca.

### 2.3 O que NÃO fazer

- ❌ Permitir que a plataforma seja usada para **falsificar produtos** ou vender produtos falsificados (responsabilidade direta da plataforma se houver conhecimento)
- ❌ Permitir uso de logo de marcas em destaque na **landing page** ou material institucional da própria plataforma (violação de marca)
- ❌ Anunciar a plataforma como "oficial" de qualquer marca

## 3. Marco Civil da Internet

### 3.1 Responsabilidade por conteúdo de terceiros

Pelo Marco Civil (Lei 12.965/2014), Art. 19, plataformas só são responsabilizadas por conteúdo de terceiros após **ordem judicial específica**. A plataforma deve:

- Manter sistema de notificação para reclamações
- Atender ordens judiciais em prazo razoável
- Manter logs de IP de acesso e modificação por 6 meses (Art. 15) — implementado via `audit_logs`

### 3.2 Logs obrigatórios

Logs mantidos por 6 meses (mínimo legal):

- IP (hash) de cada acesso ao painel
- Timestamp de criação, edição e exclusão de conteúdo público
- Identificação da usuária responsável

Implementado via `audit_logs` com trigger automático em produtos, vitrines, perfil.

## 4. Termos de Uso

### 4.1 Cláusulas obrigatórias

1. **Identificação das partes** (CNPJ, endereço da empresa, e-mail)
2. **Objeto** (descrição clara do serviço)
3. **Cadastro e conta** (requisitos, idade mínima 18 anos, veracidade)
4. **Plano gratuito e pagos** (descrição de cada plano e seus limites)
5. **Pagamento** (formas, vencimento, inadimplência)
6. **Cancelamento** (self-service, sem reembolso parcial, garantia de 7 dias)
7. **Conduta proibida** (lista clara, ex: produtos ilegais, spam, fraude)
8. **Suspensão e encerramento** (quando a plataforma pode encerrar a conta)
9. **Propriedade intelectual** (do conteúdo da usuária permanece dela; da plataforma permanece nossa)
10. **Limitação de responsabilidade** (sem garantia de ininterrupção, indenização limitada ao valor pago nos últimos 12 meses)
11. **Foro** (cidade da empresa) e **lei aplicável** (Brasil)

### 4.2 Conteúdo proibido (lista pública)

A plataforma **não aceita** vitrines com:

- Produtos farmacêuticos sob prescrição
- Produtos sexuais explícitos
- Armas e munições
- Cigarros, vapes e produtos de tabaco
- Bebidas alcoólicas para clientes não-verificados
- Produtos importados sem nota fiscal (paralelos)
- Fórmulas manipuladas sem registro Anvisa
- Esquemas de pirâmide ou marketing multinível enganoso
- Réplicas e produtos falsificados
- Conteúdo que viole direitos autorais ou de imagem

Sistema de monitoramento (manual no início, semi-automatizado depois) detecta e remove proativamente.

## 5. Política de Cookies

A plataforma usa cookies em três categorias:

| Categoria  | Cookies                                     | Necessita consentimento? |
| ---------- | ------------------------------------------- | ------------------------ |
| Essenciais | Sessão de login, CSRF token                 | Não                      |
| Funcionais | Preferência de tema, idioma                 | Não (legítimo interesse) |
| Analíticos | Plausible (sem cookies) ou GA (com cookies) | Sim, se GA               |

**Recomendação:** usar **Plausible Analytics**, que não usa cookies e dispensa banner. Reduz fricção e simplifica conformidade.

## 6. Acessibilidade

A Lei Brasileira de Inclusão (LBI, Lei 13.146/2015) torna acessibilidade obrigatória para serviços digitais. WCAG 2.1 AA é o padrão referência.

Compromissos:

- Contraste mínimo AA em todo texto
- Navegação completa via teclado
- Alt text obrigatório em imagens de produto
- ARIA labels em ícones interativos
- Estrutura semântica (headings hierárquicos, landmarks)

## 7. Itens de governança operacional

### 7.1 Empresa formalmente constituída

Para emitir nota fiscal e firmar contratos, é necessário CNPJ. Opções:

- **MEI:** até R$ 81k/ano, simples, R$ 70/mês de impostos. Atividade adequada: "Programadores de software" (CNAE 6201-5/01) com restrição de não ter sócios.
- **ME no Simples Nacional:** até R$ 360k/ano, alíquota inicial ~6% (Anexo III ou V dependendo do Fator R), permite sócios.
- **EPP:** até R$ 4,8M/ano.

Recomendação para MVP: começar como **MEI** se for solo, evoluir para ME assim que ultrapassar R$ 81k/ano ou precisar de sócio.

### 7.2 Conta bancária PJ

Necessária para receber via Asaas. Bancos digitais (Inter, Stone, Cora) têm conta PJ gratuita e abertura rápida.

### 7.3 Contador

Não-opcional. Custo R$ 200-500/mês. Tarefas:

- Apuração mensal de impostos
- Emissão de NF-e (ou supervisão da emissão automatizada)
- Declaração anual

## 8. Checklist pré-lançamento

Antes de aceitar o primeiro pagamento real, verificar:

- [ ] Empresa constituída com CNPJ ativo
- [ ] Conta bancária PJ aberta
- [ ] Contador contratado
- [ ] Termos de Uso publicados e aceitos por todos os usuários
- [ ] Política de Privacidade publicada e aceita
- [ ] Política de Cookies (se aplicável)
- [ ] Processo de exclusão de conta funcionando
- [ ] Processo de export de dados funcionando
- [ ] E-mail `dpo@dominio` ativo e monitorado
- [ ] E-mail `direitos@dominio` ativo para denúncias
- [ ] Sistema de denúncia funcionando na vitrine pública
- [ ] Logs de auditoria funcionando
- [ ] Backup automático testado
- [ ] Plano de resposta a incidentes documentado
- [ ] Revisão jurídica feita por advogado especializado
- [ ] NF-e emitindo automaticamente após pagamentos

## 9. Documentos a redigir (com advogado)

Os seguintes documentos precisam ser elaborados ou revisados por profissional jurídico antes do lançamento:

1. **Termos de Uso** (`/termos`)
2. **Política de Privacidade** (`/privacidade`)
3. **Política de Cookies** (`/cookies`) — se necessário
4. **Acordo com Embaixadoras** (programa de parceria)
5. **Contrato com prestadores** (designer freelancer, contador, DPO terceirizado se aplicável)
6. **Aviso de remoção de conteúdo** (template para responder denúncias)
