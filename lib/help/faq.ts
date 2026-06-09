/**
 * Conteúdo da FAQ (#0022) — dado puro, pt-BR, linguagem que conversa (DESIGN §1.3).
 * O texto mora aqui (app é pt-BR fixo, como os drafts legais do #0021). A busca usa
 * `filterFaq` (acento-insensível). Manter ≥ 20 perguntas no lançamento (SPEC §8).
 */
import { normalize } from "@/lib/search";

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  // — Primeiros passos —
  {
    id: "o-que-e",
    category: "Primeiros passos",
    question: "O que é o Vitrinio?",
    answer:
      "É uma vitrine digital para você, revendedora, mostrar seus produtos num link só e receber pedidos pelo WhatsApp. A venda é fechada no WhatsApp, do seu jeito — o Vitrinio organiza a sua loja online.",
  },
  {
    id: "criar-conta",
    category: "Primeiros passos",
    question: "Como crio minha conta?",
    answer:
      "Toque em “Criar conta”, use seu e-mail e senha (ou entre com o Google) e siga o passo a passo: nome, escolha do @ da sua vitrine, WhatsApp e foto. Em poucos minutos sua vitrine está no ar.",
  },
  {
    id: "precisa-pagar",
    category: "Primeiros passos",
    question: "Preciso pagar para usar?",
    answer:
      "Não. O plano Free é gratuito e permite até 5 produtos. Quando quiser produtos ilimitados e recursos extras, você pode assinar o Pro ou o Plus.",
  },
  {
    id: "o-que-e-slug",
    category: "Primeiros passos",
    question: "O que é o @ (link) da minha vitrine?",
    answer:
      "É o endereço da sua loja, tipo vitrinio.com.br/seunome. Escolha um nome curto e fácil de lembrar — é ele que você vai compartilhar com suas clientes.",
  },

  // — Produtos —
  {
    id: "cadastrar-produto",
    category: "Produtos",
    question: "Como cadastro um produto?",
    answer:
      "No painel, abra “Produtos” e toque em “Adicionar produto”. Coloque a foto, o nome e o preço. Descrição, marca, categoria e fotos extras são opcionais e deixam sua vitrine mais completa.",
  },
  {
    id: "limite-free",
    category: "Produtos",
    question: "Quantos produtos posso ter?",
    answer:
      "No Free são até 5 produtos. No Pro e no Plus os produtos são ilimitados. Ao chegar no limite do Free, aparece um aviso com a opção de fazer upgrade.",
  },
  {
    id: "varias-fotos",
    category: "Produtos",
    question: "Posso colocar mais de uma foto por produto?",
    answer:
      "Sim, até 5 fotos por produto. Você escolhe a foto de capa e a ordem das outras arrastando. A primeira é a que aparece na vitrine.",
  },
  {
    id: "preco-promocional",
    category: "Produtos",
    question: "Como faço uma promoção?",
    answer:
      "Na edição do produto, preencha o “preço promocional”. A vitrine mostra o preço antigo riscado e o novo em destaque.",
  },
  {
    id: "produto-esgotado",
    category: "Produtos",
    question: "Como marco um produto como esgotado?",
    answer:
      "Na edição do produto, marque “esgotado”. Ele continua aparecendo na vitrine, mas o botão de pedir fica desativado até você reativar.",
  },
  {
    id: "foto-fundo",
    category: "Produtos",
    question: "Como deixo a foto do produto bonita?",
    answer:
      "Use uma foto bem iluminada e, se puder, com fundo neutro. Apps gratuitos como o Photoroom removem o fundo em segundos e deixam tudo com a mesma cara. Veja o tutorial em vídeo na Central de Ajuda.",
  },

  // — Vitrine e compartilhamento —
  {
    id: "compartilhar",
    category: "Vitrine e compartilhamento",
    question: "Como compartilho minha vitrine?",
    answer:
      "Use o botão “Compartilhar” no painel ou copie o link da sua vitrine (vitrinio.com.br/seunome) e mande no WhatsApp, Instagram ou onde quiser.",
  },
  {
    id: "mudar-cores",
    category: "Vitrine e compartilhamento",
    question: "Posso mudar as cores da minha vitrine?",
    answer:
      "Sim, nos planos pagos você escolhe a cor principal e o tema (claro, escuro ou automático) para combinar com a sua marca.",
  },
  {
    id: "vitrine-no-google",
    category: "Vitrine e compartilhamento",
    question: "Minha vitrine aparece no Google?",
    answer:
      "Sim, vitrines ativas podem ser encontradas em buscadores. Quanto mais completa (nome, fotos, descrições), melhor ela aparece.",
  },

  // — Pedidos —
  {
    id: "como-recebo-pedido",
    category: "Pedidos",
    question: "Como recebo os pedidos?",
    answer:
      "Quando alguém toca em “Pedir no WhatsApp” na sua vitrine, abre uma conversa com você já com o produto preenchido. Esse interesse também aparece na aba “Pedidos” do painel.",
  },
  {
    id: "pedido-e-venda",
    category: "Pedidos",
    question: "O pedido já é uma venda?",
    answer:
      "Não. O pedido é a intenção de compra — a cliente demonstrou interesse. A venda é fechada por você no WhatsApp, combinando pagamento e entrega do seu jeito.",
  },
  {
    id: "vitrinio-recebe-pagamento",
    category: "Pedidos",
    question: "O Vitrinio recebe o pagamento das minhas vendas?",
    answer:
      "Não. O Vitrinio não processa as vendas para suas clientes nem fica com comissão. Você recebe direto, como já faz hoje.",
  },

  // — Planos e pagamento —
  {
    id: "diferenca-planos",
    category: "Planos e pagamento",
    question: "Qual a diferença entre Free, Pro e Plus?",
    answer:
      "O Free tem até 5 produtos. O Pro tem produtos ilimitados, cores personalizadas e origem do tráfego. O Plus soma vídeos, várias vitrines, domínio próprio e suporte prioritário. A comparação completa está na tela de planos.",
  },
  {
    id: "formas-pagamento",
    category: "Planos e pagamento",
    question: "Como pago a assinatura?",
    answer:
      "Por PIX, cartão de crédito ou boleto, com cobrança recorrente (mensal ou anual). No plano anual você economiza 20%.",
  },
  {
    id: "cancelar",
    category: "Planos e pagamento",
    question: "Posso cancelar quando quiser?",
    answer:
      "Sim. O cancelamento é feito por você mesma no painel, a qualquer momento. Há ainda garantia de 7 dias na primeira assinatura, com reembolso integral.",
  },
  {
    id: "atraso-pagamento",
    category: "Planos e pagamento",
    question: "O que acontece se eu atrasar o pagamento?",
    answer:
      "Avisamos por e-mail e damos um tempo para regularizar. Se não rolar, sua conta volta ao limite do Free — seus produtos não são apagados, só o que passa do limite fica oculto até você voltar a um plano pago.",
  },
  {
    id: "indicacao",
    category: "Planos e pagamento",
    question: "Como funciona a indicação de amigas?",
    answer:
      "Nos planos pagos você tem um link de indicação. Cada amiga que entra por ele ganha 30 dias de Pro grátis e, quando ela assina, você ganha 1 mês grátis na sua próxima fatura.",
  },

  // — Conta e privacidade —
  {
    id: "trocar-senha",
    category: "Conta e privacidade",
    question: "Esqueci minha senha, e agora?",
    answer:
      "Na tela de login, toque em “Esqueci a senha” e siga o link enviado para o seu e-mail para criar uma nova.",
  },
  {
    id: "exportar-dados",
    category: "Conta e privacidade",
    question: "Posso baixar meus dados?",
    answer:
      "Sim. Em Conta › Meus dados você exporta seus dados pessoais (JSON) e seus produtos (CSV ou JSON) quando quiser.",
  },
  {
    id: "excluir-conta",
    category: "Conta e privacidade",
    question: "Como excluo minha conta?",
    answer:
      "Em Conta, use “Excluir minha conta”. Sua vitrine sai do ar na hora; seus dados são anonimizados em até 30 dias e excluídos em até 90 dias, conforme a LGPD.",
  },
];

/** Filtra a FAQ por pergunta+resposta (acento-insensível). Vazio → tudo. */
export function filterFaq(items: FaqItem[], query: string): FaqItem[] {
  const q = normalize(query);
  if (!q) return items;
  return items.filter((item) => normalize(`${item.question} ${item.answer}`).includes(q));
}

/** Categorias na ordem de primeira aparição. */
export function faqCategories(items: FaqItem[]): string[] {
  const seen: string[] = [];
  for (const item of items) if (!seen.includes(item.category)) seen.push(item.category);
  return seen;
}

/**
 * Subconjunto curado para a landing (#0025) — as perguntas mais decisivas na
 * conversão, nesta ordem. A FAQ completa e pesquisável vive em `/ajuda`.
 */
export const LANDING_FAQ_IDS = [
  "o-que-e",
  "precisa-pagar",
  "como-recebo-pedido",
  "pedido-e-venda",
  "diferenca-planos",
  "cancelar",
] as const;

export function landingFaq(): FaqItem[] {
  return LANDING_FAQ_IDS.map((id) => FAQ_ITEMS.find((item) => item.id === id)).filter(
    (item): item is FaqItem => item !== undefined,
  );
}
