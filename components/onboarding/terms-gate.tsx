"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { acceptTermsAction } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LEGAL_ROUTES } from "@/lib/legal/links";

/**
 * Gate de aceite dos Termos no onboarding (#0021). Cobre quem entra por Google OAuth
 * (não passa pelo checkbox do cadastro) e o reaceite quando a versão vigente muda.
 * Registra o aceite (versão + timestamp) antes de liberar o wizard.
 */
export function TermsGate({ onAccepted }: { onAccepted: () => void }) {
  const [checked, setChecked] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const result = await acceptTermsAction();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      onAccepted();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Antes de começar</CardTitle>
        <CardDescription>Precisamos do seu aceite para continuar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2">
          <Checkbox
            id="acceptTerms"
            className="mt-0.5"
            checked={checked}
            onCheckedChange={(v) => setChecked(v === true)}
          />
          <Label htmlFor="acceptTerms" className="text-sm font-normal leading-snug">
            Li e aceito os{" "}
            <a
              href={LEGAL_ROUTES.termos}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4"
            >
              Termos de Uso
            </a>{" "}
            e a{" "}
            <a
              href={LEGAL_ROUTES.privacidade}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4"
            >
              Política de Privacidade
            </a>
            . Declaro ser responsável pelas imagens e marcas que cadastrar.
          </Label>
        </div>
        <Button type="button" className="w-full" disabled={!checked || pending} onClick={confirm}>
          {pending ? "Salvando…" : "Aceitar e continuar"}
        </Button>
      </CardContent>
    </Card>
  );
}
