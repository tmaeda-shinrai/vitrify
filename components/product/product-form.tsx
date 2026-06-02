"use client";

import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createProductAction,
  createProductImageUploadUrl,
} from "@/app/(dashboard)/produtos/actions";
import { FieldError } from "@/components/auth/field-error";
import { ImageUploader } from "@/components/shared/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProductDraft } from "@/hooks/use-product-draft";
import { formatBRL, parseBRLToCents } from "@/lib/money";
import type { ProductListItem } from "@/lib/products";
import {
  PRODUCT_DESC_MAX,
  productFormSchema,
  type ProductFormValues,
} from "@/lib/validators/product";

interface Props {
  vitrineId: string;
  onCreated: (product: ProductListItem) => void;
  onLimitReached: () => void;
}

export function ProductForm({ vitrineId, onCreated, onLimitReached }: Props) {
  const t = useTranslations("produtos");
  const { initialDraft, save, clear } = useProductDraft(vitrineId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialDraft?.name ?? "",
      price: initialDraft?.price ?? "",
      description: initialDraft?.description ?? "",
      imageUrl: initialDraft?.imageUrl ?? "",
    },
  });

  const name = watch("name");
  const price = watch("price");
  const description = watch("description") ?? "";
  const imageUrl = watch("imageUrl") ?? "";

  // Avisa uma vez se havia rascunho recuperado.
  const announced = useRef(false);
  useEffect(() => {
    if (!announced.current && initialDraft) {
      announced.current = true;
      toast.info(t("draftRecovered"));
    }
  }, [initialDraft, t]);

  // Auto-save (~5s após a última mudança).
  useEffect(() => {
    save({ name, price, description, imageUrl });
  }, [name, price, description, imageUrl, save]);

  const priceReg = register("price");

  async function onSubmit(values: ProductFormValues) {
    const priceCents = parseBRLToCents(values.price);
    if (priceCents === null) return; // o schema já garante; satisfaz o TS

    const result = await createProductAction({
      name: values.name,
      description: values.description ?? "",
      priceCents,
      imageUrl: values.imageUrl,
    });

    if (!result.ok) {
      if (result.code === "PLAN_LIMIT_REACHED") {
        onLimitReached();
        return;
      }
      toast.error(result.error ?? t("genericError"));
      return;
    }

    clear();
    toast.success(t("created"));
    onCreated(result.product!);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1">
        <Label>{t("photoLabel")}</Label>
        <ImageUploader
          value={imageUrl || null}
          onUploaded={(url) =>
            setValue("imageUrl", url, { shouldValidate: true, shouldDirty: true })
          }
          createUploadUrl={createProductImageUploadUrl}
          bucket="products"
          shape="square"
        />
        <FieldError message={errors.imageUrl?.message} />
      </div>

      <div>
        <Label htmlFor="name">{t("nameLabel")}</Label>
        <Input id="name" placeholder={t("namePlaceholder")} {...register("name")} />
        <FieldError message={errors.name?.message} />
      </div>

      <div>
        <Label htmlFor="price">{t("priceLabel")}</Label>
        <Input
          id="price"
          inputMode="decimal"
          placeholder={t("pricePlaceholder")}
          {...priceReg}
          onBlur={(e) => {
            priceReg.onBlur(e);
            const cents = parseBRLToCents(e.target.value);
            if (cents !== null) {
              setValue("price", formatBRL(cents).replace("R$", "").trim(), {
                shouldValidate: true,
              });
            }
          }}
        />
        <FieldError message={errors.price?.message} />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="description">{t("descriptionLabel")}</Label>
          <span className="text-xs text-muted-foreground">
            {description.length}/{PRODUCT_DESC_MAX}
          </span>
        </div>
        <Textarea
          id="description"
          rows={3}
          maxLength={PRODUCT_DESC_MAX}
          placeholder={t("descriptionPlaceholder")}
          {...register("description")}
        />
        <FieldError message={errors.description?.message} />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t("saving") : t("save")}
      </Button>
    </form>
  );
}
