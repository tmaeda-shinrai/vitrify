import type { Metadata } from "next";

import { LegalList, LegalPage, LegalSection } from "@/components/legal/legal-page";
import { DPO_EMAIL, RIGHTS_EMAIL } from "@/lib/legal/links";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como o Vitrinio trata seus dados pessoais, conforme a LGPD.",
  robots: { index: true, follow: true },
};

const UPDATED_AT = "7 de junho de 2026";

export default function PrivacidadePage() {
  return (
    <LegalPage title="Política de Privacidade" updatedAt={UPDATED_AT}>
      <p>
        Esta Política descreve como a Plataforma Vitrinio trata dados pessoais, em conformidade com
        a Lei Geral de Proteção de Dados (Lei 13.709/2018 — LGPD). O Encarregado de Proteção de
        Dados (DPO) pode ser contatado em <strong>{DPO_EMAIL}</strong>.
      </p>

      <LegalSection title="1. Dados que coletamos e bases legais">
        <p>Tratamos os seguintes dados pessoais, sob as bases legais indicadas:</p>
        <LegalList
          items={[
            "E-mail — no cadastro, para execução do contrato; compartilhado com a Resend (envio de e-mails).",
            "Nome — no cadastro, para execução do contrato.",
            "Senha (hash) — no cadastro; armazenada pelo Supabase Auth.",
            "Foto de perfil, WhatsApp e bio — no onboarding, para execução do contrato (WhatsApp e bio ficam públicos por escolha da Usuária).",
            "Hash de IP — em visitas e intenções de pedido, por legítimo interesse (segurança e analytics agregada).",
            "Dados de pagamento — no checkout, para execução do contrato; processados pela Asaas.",
            "CPF/CNPJ de faturamento — no checkout, por obrigação legal; compartilhados com Asaas e contador. Não armazenamos o CPF/CNPJ em nossos servidores (forward-only ao gateway).",
          ]}
        />
      </LegalSection>

      <LegalSection title="2. Seus direitos como titular">
        <p>A LGPD (Art. 18) garante a você os seguintes direitos:</p>
        <LegalList
          items={[
            "Confirmação e acesso aos seus dados — tela “Meus dados”, com exportação em JSON.",
            "Correção — edição direta no perfil.",
            "Anonimização ou eliminação — botão “Excluir minha conta”.",
            "Portabilidade — exportação de produtos e dados pessoais em CSV/JSON.",
            "Revogação de consentimento — disponível em Configurações > Privacidade.",
            "Informação sobre compartilhamento — esta Política lista todos os terceiros.",
          ]}
        />
        <p>
          Para exercer qualquer direito, use as ferramentas do painel ou escreva para{" "}
          <strong>{RIGHTS_EMAIL}</strong>.
        </p>
      </LegalSection>

      <LegalSection title="3. Retenção de dados">
        <p>Mantemos seus dados pelos seguintes prazos:</p>
        <LegalList
          items={[
            "Conta ativa: enquanto a conta existir.",
            "Conta excluída: anonimização em 30 dias e exclusão completa em 90 dias.",
            "Logs de auditoria: 180 dias (segurança, Marco Civil).",
            "Hash de IP em intenções de pedido: 12 meses.",
            "Dados fiscais: 5 anos (obrigação tributária).",
            "Backups: 90 dias (rotativos).",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Compartilhamento com terceiros">
        <p>
          Compartilhamos dados apenas com prestadores necessários à operação do serviço, cada um com
          finalidade específica:
        </p>
        <LegalList
          items={[
            "Supabase — banco de dados, autenticação e armazenamento (região São Paulo, Brasil).",
            "Resend — envio de e-mails transacionais (processamento nos EUA).",
            "Asaas — processamento de pagamentos (Brasil).",
            "Sentry — monitoramento de erros, configurado para anonimizar dados pessoais (processamento nos EUA).",
            "Vercel — hospedagem e roteamento, sem armazenar dados pessoais.",
          ]}
        />
        <p>
          Transferências internacionais (EUA) referem-se a serviços comuns de e-mail e
          monitoramento, amparadas por cláusulas contratuais adequadas.
        </p>
      </LegalSection>

      <LegalSection title="5. Segurança e incidentes">
        <p>
          Adotamos medidas técnicas e organizacionais para proteger seus dados (controle de acesso,
          criptografia em trânsito, anonimização de PII em logs). Em caso de incidente de segurança
          relevante, seguimos nosso plano de resposta, notificando a ANPD e os titulares afetados
          nos prazos legais.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies">
        <p>
          Usamos apenas cookies essenciais (sessão de login) e funcionais (preferência de tema).
          Para analytics utilizamos solução sem cookies. Detalhes na nossa Política de Cookies.
        </p>
      </LegalSection>

      <LegalSection title="7. Alterações nesta Política">
        <p>
          Podemos atualizar esta Política. Mudanças materiais serão comunicadas e, quando exigirem,
          solicitaremos novo aceite. A versão vigente está indicada no topo desta página.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
