import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ContaTabs } from "@/components/conta/conta-tabs";
import { MarketingConsent } from "@/components/conta/marketing-consent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LEGAL_ROUTES } from "@/lib/legal/links";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Privacidade" };

export default async function PrivacidadePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("marketing_opt_in")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="font-display text-2xl font-bold">Privacidade</h1>
      <ContaTabs />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comunicações</CardTitle>
        </CardHeader>
        <CardContent>
          <MarketingConsent initial={profile?.marketing_opt_in ?? true} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Como tratamos seus dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Detalhamos o que coletamos, por quê e com quem compartilhamos na{" "}
            <Link
              href={LEGAL_ROUTES.privacidade}
              className="text-primary underline-offset-4 hover:underline"
            >
              Política de Privacidade
            </Link>
            .
          </p>
          <p>
            Para acessar ou exportar seus dados, use a aba{" "}
            <Link href="/conta/dados" className="text-primary underline-offset-4 hover:underline">
              Meus dados
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
