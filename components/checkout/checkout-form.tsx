"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FieldError } from "@/components/auth/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { checkoutSchema, type CheckoutInput } from "@/lib/validators/checkout";

export interface CheckoutPlanOption {
  plan: "pro" | "plus";
  name: string;
  priceLabel: string;
  description: string;
}

interface Props {
  options: CheckoutPlanOption[];
  defaultPlan: "pro" | "plus";
}

/**
 * Formulário de checkout (#0018). Coleta o plano e o CPF/CNPJ, chama `/api/checkout`
 * e redireciona para a página hospedada do Asaas (`invoiceUrl`). Período fixo em
 * mensal por ora (o anual entra com a tela de planos em #0019). Falha não entra em
 * loop: erro vira toast e o botão volta a ficar disponível.
 */
export function CheckoutForm({ options, defaultPlan }: Props) {
  const t = useTranslations("assinar");
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { plan: defaultPlan, period: "monthly", cpfCnpj: "" },
  });

  const selected = watch("plan");

  async function onSubmit(values: CheckoutInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => null)) as {
        invoiceUrl?: string;
        error?: string;
      } | null;

      if (!res.ok || !data?.invoiceUrl) {
        toast.error(data?.error ?? t("genericError"));
        setSubmitting(false);
        return;
      }
      // Redireciona para a página de pagamento do Asaas (PIX/cartão/boleto).
      window.location.href = data.invoiceUrl;
    } catch {
      toast.error(t("genericError"));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-medium">{t("choosePlan")}</legend>
        {options.map((opt) => (
          <label
            key={opt.plan}
            className={cn(
              "flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-4 transition-colors",
              selected === opt.plan
                ? "border-primary ring-2 ring-primary"
                : "border-input hover:border-primary/50",
            )}
          >
            <span>
              <span className="block font-medium">{opt.name}</span>
              <span className="block text-sm text-muted-foreground">{opt.description}</span>
            </span>
            <span className="whitespace-nowrap font-display font-semibold">{opt.priceLabel}</span>
            <input type="radio" value={opt.plan} className="sr-only" {...register("plan")} />
          </label>
        ))}
        <FieldError message={errors.plan?.message} />
      </fieldset>

      <div>
        <Label htmlFor="cpfCnpj">{t("cpfCnpjLabel")}</Label>
        <Input
          id="cpfCnpj"
          inputMode="numeric"
          autoComplete="off"
          placeholder={t("cpfCnpjPlaceholder")}
          {...register("cpfCnpj")}
          aria-invalid={!!errors.cpfCnpj}
        />
        <FieldError message={errors.cpfCnpj?.message} />
        <p className="mt-1.5 text-xs text-muted-foreground">{t("cpfCnpjHint")}</p>
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? t("submitting") : t("submit")}
      </Button>
      <p className="text-center text-xs text-muted-foreground">{t("redirectNote")}</p>
    </form>
  );
}
