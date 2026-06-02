"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { saveNameAction } from "@/app/onboarding/actions";
import { FieldError } from "@/components/auth/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nameStepSchema, type NameStepInput } from "@/lib/validators/onboarding";

export function StepName({
  defaultValue,
  onDone,
}: {
  defaultValue: string;
  onDone: (fullName: string) => void;
}) {
  const t = useTranslations("onboarding");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NameStepInput>({
    resolver: zodResolver(nameStepSchema),
    defaultValues: { fullName: defaultValue },
  });

  async function onSubmit(values: NameStepInput) {
    const result = await saveNameAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    onDone(values.fullName.trim());
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="fullName">{t("nameLabel")}</Label>
        <Input id="fullName" autoComplete="name" autoFocus {...register("fullName")} />
        <FieldError message={errors.fullName?.message} />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {t("continue")}
      </Button>
    </form>
  );
}
