import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { RequestResetForm } from "@/components/auth/request-reset-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Recuperar senha" };

export default async function RecuperarSenhaPage() {
  const t = await getTranslations("auth");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recoverTitle")}</CardTitle>
        <CardDescription>{t("recoverDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <RequestResetForm />
      </CardContent>
    </Card>
  );
}
