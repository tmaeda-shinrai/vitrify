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
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";
import { checkoutSchema, type CheckoutInput } from "@/lib/validators/checkout";

export interface CheckoutPlanOption {
  plan: "pro" | "plus";
  name: string;
  description: string;
  monthlyCents: number;
  yearlyCents: number;
}

interface Props {
  options: CheckoutPlanOption[];
  defaultPlan: "pro" | "plus";
}

const PERIODS = ["monthly", "yearly"] as const;

/**
 * Formulário de checkout (#0018, evoluído na #0019). Escolhe plano + período
 * (mensal/anual -20%) + CPF/CNPJ, chama `/api/checkout` e redireciona para a página
 * hospedada do Asaas (`invoiceUrl`). Falha não entra em loop: erro vira toast.
 */
export function CheckoutForm({ options, defaultPlan }: Props) {
  const t = useTranslations("assinar");
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { plan: defaultPlan, period: "monthly", cpfCnpj: "" },
  });

  const selectedPlan = watch("plan");
  const selectedPeriod = watch("period");

  function priceLabel(opt: CheckoutPlanOption): string {
    if (selectedPeriod === "yearly") {
      return t("perYear", { price: formatBRL(opt.yearlyCents) });
    }
    return t("perMonth", { price: formatBRL(opt.monthlyCents) });
  }

  function subLabel(opt: CheckoutPlanOption): string | null {
    if (selectedPeriod !== "yearly") return null;
    return t("perMonthEquivalent", { price: formatBRL(Math.round(opt.yearlyCents / 12)) });
  }

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
      <input type="hidden" {...register("period")} />

      <div
        className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
        role="radiogroup"
        aria-label={t("billingPeriod")}
      >
        {PERIODS.map((period) => (
          <button
            key={period}
            type="button"
            role="radio"
            aria-checked={selectedPeriod === period}
            onClick={() => setValue("period", period)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              selectedPeriod === period
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {period === "yearly" ? t("periodYearly") : t("periodMonthly")}
          </button>
        ))}
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm font-medium">{t("choosePlan")}</legend>
        {options.map((opt) => (
          <label
            key={opt.plan}
            className={cn(
              "flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-4 transition-colors",
              selectedPlan === opt.plan
                ? "border-primary ring-2 ring-primary"
                : "border-input hover:border-primary/50",
            )}
          >
            <span>
              <span className="block font-medium">{opt.name}</span>
              <span className="block text-sm text-muted-foreground">{opt.description}</span>
            </span>
            <span className="text-right">
              <span className="block whitespace-nowrap font-display font-semibold">
                {priceLabel(opt)}
              </span>
              {subLabel(opt) ? (
                <span className="block whitespace-nowrap text-xs text-muted-foreground">
                  {subLabel(opt)}
                </span>
              ) : null}
            </span>
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
