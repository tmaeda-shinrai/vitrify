"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateVitrineAction } from "@/app/(dashboard)/conta/actions";
import { FieldError } from "@/components/auth/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isReservedSlug, SLUG_REGEX } from "@/lib/slug";
import { createClient } from "@/lib/supabase/browser";
import { vitrineSchema, type VitrineInput } from "@/lib/validators/profile";

type SlugStatus = "idle" | "invalid" | "reserved" | "checking" | "available" | "taken";

interface Props {
  initial: { slug: string; title: string; subtitle: string };
}

export function VitrineForm({ initial }: Props) {
  const t = useTranslations("conta");
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VitrineInput>({
    resolver: zodResolver(vitrineSchema),
    defaultValues: { slug: initial.slug, title: initial.title, subtitle: initial.subtitle },
  });

  const slug = watch("slug");
  const [status, setStatus] = useState<SlugStatus>("idle");
  const reqId = useRef(0);

  useEffect(() => {
    if (slug === initial.slug) return setStatus("idle");
    if (!SLUG_REGEX.test(slug)) return setStatus("invalid");
    if (isReservedSlug(slug)) return setStatus("reserved");

    setStatus("checking");
    const current = ++reqId.current;
    const timer = setTimeout(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("is_slug_available", { p_slug: slug });
      if (current !== reqId.current) return;
      setStatus(error ? "idle" : data ? "available" : "taken");
    }, 400);
    return () => clearTimeout(timer);
  }, [slug, initial.slug]);

  async function onSubmit(values: VitrineInput) {
    const result = await updateVitrineAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["current-user"] });
    toast.success(t("saved"));
  }

  const slugChanged = slug !== initial.slug;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="slug">{t("slug")}</Label>
        <div className="flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <span className="pl-3 text-sm text-muted-foreground">vitrinio.com.br/</span>
          <Input
            id="slug"
            {...register("slug")}
            className="border-0 pl-1 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <FieldError message={errors.slug?.message} />
        {status === "taken" ? (
          <p className="mt-1.5 text-sm text-destructive">{t("slugTaken")}</p>
        ) : null}
        {status === "available" ? (
          <p className="mt-1.5 text-sm text-emerald-600">{t("slugAvailable")}</p>
        ) : null}
        {slugChanged ? (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="size-3.5 shrink-0" />
            {t("slugChangeWarning")}
          </p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="title">{t("titleField")}</Label>
        <Input id="title" {...register("title")} />
        <FieldError message={errors.title?.message} />
      </div>

      <div>
        <Label htmlFor="subtitle">{t("subtitle")}</Label>
        <Input id="subtitle" {...register("subtitle")} />
        <FieldError message={errors.subtitle?.message} />
      </div>

      <Button type="submit" disabled={isSubmitting || status === "taken" || status === "invalid"}>
        {isSubmitting ? t("saving") : t("save")}
      </Button>
    </form>
  );
}
