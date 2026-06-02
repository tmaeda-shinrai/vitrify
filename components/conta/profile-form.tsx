"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createAvatarUploadUrl, updateProfileAction } from "@/app/(dashboard)/conta/actions";
import { FieldError } from "@/components/auth/field-error";
import { ImageUploader } from "@/components/shared/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BIO_MAX_LENGTH, profileSchema, type ProfileInput } from "@/lib/validators/profile";

/** Mostra o WhatsApp salvo (E.164 sem +) como (DD) 9XXXX-XXXX. */
function formatStoredWhatsapp(value: string): string {
  const d = value.replace(/^55/, "").replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

interface Props {
  initial: { fullName: string; bio: string; whatsapp: string; avatarUrl: string | null };
}

export function ProfileForm({ initial }: Props) {
  const t = useTranslations("conta");
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: initial.fullName,
      bio: initial.bio,
      whatsapp: formatStoredWhatsapp(initial.whatsapp),
      avatarUrl: initial.avatarUrl,
    },
  });

  const bioValue = watch("bio") ?? "";
  const avatarUrl = watch("avatarUrl") ?? null;

  async function onSubmit(values: ProfileInput) {
    const result = await updateProfileAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["current-user"] });
    toast.success(t("saved"));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <ImageUploader
        value={avatarUrl}
        onUploaded={(url) => setValue("avatarUrl", url)}
        createUploadUrl={createAvatarUploadUrl}
        bucket="avatars"
        shape="round"
      />

      <div>
        <Label htmlFor="fullName">{t("name")}</Label>
        <Input id="fullName" autoComplete="name" {...register("fullName")} />
        <FieldError message={errors.fullName?.message} />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="bio">{t("bio")}</Label>
          <span className="text-xs text-muted-foreground">
            {bioValue.length}/{BIO_MAX_LENGTH}
          </span>
        </div>
        <Textarea id="bio" rows={3} maxLength={BIO_MAX_LENGTH} {...register("bio")} />
        <FieldError message={errors.bio?.message} />
      </div>

      <div>
        <Label htmlFor="whatsapp">{t("whatsapp")}</Label>
        <Input id="whatsapp" inputMode="numeric" {...register("whatsapp")} />
        <FieldError message={errors.whatsapp?.message} />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("saving") : t("save")}
      </Button>
    </form>
  );
}
