"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { signUpAction } from "@/app/(auth)/actions";
import { FieldError } from "@/components/auth/field-error";
import { GoogleButton } from "@/components/auth/google-button";
import { OrDivider } from "@/components/auth/or-divider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LEGAL_ROUTES } from "@/lib/legal/links";
import { signUpSchema, type SignUpInput } from "@/lib/validators/auth";

export function SignUpForm() {
  const router = useRouter();
  const t = useTranslations("auth");
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  async function onSubmit(values: SignUpInput) {
    const result = await signUpAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    router.replace("/cadastro/verifique-email");
  }

  return (
    <div className="space-y-4">
      <GoogleButton />
      <OrDivider />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="fullName">{t("fullName")}</Label>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            {...register("fullName")}
            aria-invalid={!!errors.fullName}
          />
          <FieldError message={errors.fullName?.message} />
        </div>

        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          <FieldError message={errors.email?.message} />
        </div>

        <div>
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
            aria-invalid={!!errors.password}
          />
          <FieldError message={errors.password?.message} />
        </div>

        <div>
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            aria-invalid={!!errors.confirmPassword}
          />
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <Controller
              name="termsAccepted"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="termsAccepted"
                  className="mt-0.5"
                  checked={field.value === true}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  aria-invalid={!!errors.termsAccepted}
                />
              )}
            />
            <Label htmlFor="termsAccepted" className="text-sm font-normal leading-snug">
              {t("termsBefore")}{" "}
              <a
                href={LEGAL_ROUTES.termos}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                {t("termsLink")}
              </a>{" "}
              {t("termsAnd")}{" "}
              <a
                href={LEGAL_ROUTES.privacidade}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                {t("privacyLink")}
              </a>
              . {t("termsResponsibility")}
            </Label>
          </div>
          <FieldError message={errors.termsAccepted?.message} />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t("signupSubmitting") : t("signup")}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t("hasAccount")}{" "}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            {t("login")}
          </Link>
        </p>
      </form>
    </div>
  );
}
