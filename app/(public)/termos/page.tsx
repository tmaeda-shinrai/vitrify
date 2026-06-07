import type { Metadata } from "next";

import { LegalList, LegalPage, LegalSection } from "@/components/legal/legal-page";
import { DPO_EMAIL, RIGHTS_EMAIL } from "@/lib/legal/links";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de Uso da plataforma Vitrinio.",
  robots: { index: true, follow: true },
};

const UPDATED_AT = "7 de junho de 2026";

export default function TermosPage() {
  return (
    <LegalPage title="Termos de Uso" updatedAt={UPDATED_AT}>
      <p>
        Estes Termos de Uso regulam o acesso e o uso da plataforma Vitrinio
        (&quot;Plataforma&quot;), um serviço de criação de vitrines digitais para revendedoras. Ao
        criar uma conta ou utilizar a Plataforma, você (&quot;Usuária&quot;) declara ter lido,
        compreendido e aceitado estes Termos.
      </p>

      <LegalSection title="1. Identificação das partes">
        <p>
          A Plataforma é operada pela empresa responsável pelo Vitrinio (&quot;nós&quot;), inscrita
          no CNPJ a ser informado, com contato pelo e-mail <strong>{DPO_EMAIL}</strong>. Os dados
          completos da empresa (razão social, CNPJ e endereço) constarão desta seção após a
          constituição formal, antes do lançamento comercial.
        </p>
      </LegalSection>

      <LegalSection title="2. Objeto">
        <p>
          A Plataforma permite que a Usuária monte uma vitrine digital pública para exibir produtos
          (foto, nome e preço) e receber intenções de pedido via WhatsApp. A venda é concluída
          diretamente entre a Usuária e seus clientes pelo WhatsApp — a Plataforma não processa
          carrinho, pagamento ou entrega de pedidos de clientes finais.
        </p>
      </LegalSection>

      <LegalSection title="3. Cadastro e conta">
        <p>
          O cadastro exige e-mail válido e veracidade das informações. A Usuária deve ter no mínimo
          18 anos e é responsável por manter a confidencialidade de suas credenciais. É vedado criar
          conta em nome de terceiros sem autorização.
        </p>
      </LegalSection>

      <LegalSection title="4. Planos gratuito e pagos">
        <p>
          A Plataforma oferece um plano gratuito (Free) com limites de produtos e recursos, e planos
          pagos (Pro e Plus) com mais recursos e limites ampliados. A descrição vigente de cada
          plano e seus limites está disponível na página de planos. Reservamo-nos o direito de
          ajustar recursos e preços mediante aviso prévio.
        </p>
      </LegalSection>

      <LegalSection title="5. Pagamento">
        <p>
          As assinaturas pagas são recorrentes (mensal ou anual) e cobradas pelo gateway Asaas, via
          PIX, cartão ou boleto. O não pagamento implica inadimplência: após o vencimento, a conta
          pode ser rebaixada para o plano Free conforme a política de cobrança, sem exclusão dos
          produtos cadastrados.
        </p>
      </LegalSection>

      <LegalSection title="6. Cancelamento e garantia">
        <p>
          O cancelamento é self-service e pode ser feito a qualquer momento no painel. Não há
          reembolso proporcional de período já iniciado. Garantimos reembolso integral em até{" "}
          <strong>7 dias</strong> da primeira contratação (direito de arrependimento).
        </p>
      </LegalSection>

      <LegalSection title="7. Conduta proibida e conteúdo vedado">
        <p>A Plataforma não aceita vitrines que ofereçam ou divulguem:</p>
        <LegalList
          items={[
            "Produtos farmacêuticos sob prescrição",
            "Produtos sexuais explícitos",
            "Armas e munições",
            "Cigarros, vapes e produtos de tabaco",
            "Bebidas alcoólicas para clientes não verificados",
            "Produtos importados sem nota fiscal (paralelos)",
            "Fórmulas manipuladas sem registro na Anvisa",
            "Esquemas de pirâmide ou marketing multinível enganoso",
            "Réplicas e produtos falsificados",
            "Conteúdo que viole direitos autorais ou de imagem de terceiros",
          ]}
        />
        <p>
          Também são vedados spam, fraude, uso da Plataforma para fins ilícitos e qualquer tentativa
          de comprometer a segurança do serviço.
        </p>
      </LegalSection>

      <LegalSection title="8. Responsabilidade sobre imagens e marcas">
        <p>
          Ao cadastrar produtos na Plataforma, a Usuária declara possuir os direitos necessários
          sobre as imagens, descrições e marcas reproduzidas, ou estar autorizada a usá-las. A
          Usuária é integralmente responsável por qualquer reclamação de terceiros referente ao
          conteúdo cadastrado, isentando a Plataforma de responsabilidade nessa esfera.
        </p>
        <p>
          Denúncias de violação de direitos autorais, de marca ou de imagem podem ser enviadas para{" "}
          <strong>{RIGHTS_EMAIL}</strong> e são respondidas em até 48 horas, com remoção cautelar do
          conteúdo enquanto a análise ocorre.
        </p>
      </LegalSection>

      <LegalSection title="9. Suspensão e encerramento">
        <p>
          Podemos suspender ou encerrar contas que violem estes Termos, a legislação aplicável ou
          que coloquem em risco a Plataforma ou terceiros, com aviso quando possível. A Usuária pode
          encerrar a conta a qualquer momento pelo painel.
        </p>
      </LegalSection>

      <LegalSection title="10. Propriedade intelectual">
        <p>
          O conteúdo cadastrado pela Usuária (textos, fotos, marca da vitrine) permanece de
          titularidade dela. O software, a marca Vitrinio, o design e os demais elementos da
          Plataforma permanecem de nossa titularidade.
        </p>
      </LegalSection>

      <LegalSection title="11. Limitação de responsabilidade">
        <p>
          A Plataforma é fornecida &quot;no estado em que se encontra&quot;, sem garantia de
          operação ininterrupta ou livre de erros. Nossa responsabilidade, quando cabível, limita-se
          ao valor pago pela Usuária nos 12 meses anteriores ao evento que originou a demanda.
        </p>
      </LegalSection>

      <LegalSection title="12. Foro e lei aplicável">
        <p>
          Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da comarca da sede
          da empresa para dirimir controvérsias, com renúncia a qualquer outro, por mais
          privilegiado que seja.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
