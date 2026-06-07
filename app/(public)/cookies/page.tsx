import type { Metadata } from "next";

import { LegalList, LegalPage, LegalSection } from "@/components/legal/legal-page";
import { LEGAL_ROUTES } from "@/lib/legal/links";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Como o Vitrinio usa cookies.",
  robots: { index: true, follow: true },
};

const UPDATED_AT = "7 de junho de 2026";

export default function CookiesPage() {
  return (
    <LegalPage title="Política de Cookies" updatedAt={UPDATED_AT}>
      <p>
        Esta Política explica como a Plataforma Vitrinio utiliza cookies e tecnologias semelhantes.
        Adotamos uma abordagem minimalista: usamos apenas cookies necessários ao funcionamento e às
        preferências do serviço, sem cookies de rastreamento publicitário.
      </p>

      <LegalSection title="1. Categorias de cookies que usamos">
        <LegalList
          items={[
            "Essenciais — sessão de login e proteção contra CSRF. Indispensáveis e não exigem consentimento.",
            "Funcionais — preferências como tema (claro/escuro). Tratados por legítimo interesse; não exigem consentimento.",
          ]}
        />
      </LegalSection>

      <LegalSection title="2. Analytics sem cookies">
        <p>
          Para entender o uso agregado da Plataforma utilizamos uma solução de analytics que não
          emprega cookies nem identifica pessoas individualmente. Por isso, não exibimos banner de
          consentimento de cookies.
        </p>
      </LegalSection>

      <LegalSection title="3. Gerenciamento">
        <p>
          Você pode bloquear ou apagar cookies nas configurações do seu navegador. Note que
          desativar os cookies essenciais pode impedir o login e o uso normal da Plataforma.
        </p>
      </LegalSection>

      <LegalSection title="4. Mais informações">
        <p>
          Para detalhes sobre o tratamento dos seus dados, consulte a nossa{" "}
          <a
            href={LEGAL_ROUTES.privacidade}
            className="text-primary underline-offset-4 hover:underline"
          >
            Política de Privacidade
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
