import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Download } from "lucide-react";

import { ContaTabs } from "@/components/conta/conta-tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Meus dados" };

/** Dados pessoais coletados (espelha `docs/LEGAL.md` §1.3) — transparência ao titular. */
const COLLECTED = [
  "Nome e e-mail (cadastro)",
  "Foto de perfil, WhatsApp e bio (onboarding)",
  "Produtos, categorias e marcas da sua vitrine",
  "Plano e histórico de pagamentos",
  "Registro de atividade (auditoria) e hash de IP de acesso",
];

const THIRD_PARTIES = [
  "Supabase (banco, autenticação e arquivos)",
  "Resend (envio de e-mails)",
  "Asaas (pagamentos)",
  "Sentry (monitoramento de erros, com PII anonimizada)",
  "Vercel (hospedagem)",
];

export default async function DadosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="font-display text-2xl font-bold">Meus dados</h1>
      <ContaTabs />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados que tratamos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <ul className="list-disc space-y-1 pl-5">
            {COLLECTED.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            Compartilhamos dados apenas com os prestadores necessários: {THIRD_PARTIES.join(", ")}.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Exportar meus dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Baixe uma cópia dos seus dados (acesso e portabilidade — LGPD Art. 18).
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <DownloadLink href="/api/conta/export?tipo=pessoais&formato=json">
              Dados pessoais (JSON)
            </DownloadLink>
            <DownloadLink href="/api/conta/export?tipo=produtos&formato=csv">
              Produtos (CSV)
            </DownloadLink>
            <DownloadLink href="/api/conta/export?tipo=produtos&formato=json">
              Produtos (JSON)
            </DownloadLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DownloadLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      download
      className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <Download className="size-4" aria-hidden />
      {children}
    </a>
  );
}
