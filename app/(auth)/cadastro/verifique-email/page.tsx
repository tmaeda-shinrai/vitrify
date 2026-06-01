import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Verifique seu e-mail" };

export default async function VerifiqueEmailPage() {
  const t = await getTranslations("auth");
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <MailCheck className="mb-2 size-10 text-primary" />
        <CardTitle>{t("verifyEmailTitle")}</CardTitle>
        <CardDescription>{t("verifyEmailDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-center text-sm text-muted-foreground">{t("verifyEmailHelp")}</p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">{t("backToLogin")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
