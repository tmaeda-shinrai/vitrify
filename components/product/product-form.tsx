"use client";

import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createProductAction,
  createProductImageUploadUrl,
  updateProductAction,
} from "@/app/(dashboard)/produtos/actions";
import { FieldError } from "@/components/auth/field-error";
import { ImageUploader } from "@/components/shared/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useProductDraft } from "@/hooks/use-product-draft";
import { formatBRL, parseBRLToCents } from "@/lib/money";
import type { CategoryItem, ProductListItem } from "@/lib/products";
import {
  PRODUCT_DESC_MAX,
  productFormSchema,
  type ProductFormValues,
} from "@/lib/validators/product";

const NO_CATEGORY = "none";

interface Props {
  vitrineId: string;
  /** Quando presente, o formulário edita o produto; senão, cria um novo. */
  product?: ProductListItem | null;
  categories: CategoryItem[];
  brandSuggestions: string[];
  onSaved: (product: ProductListItem) => void;
  onLimitReached: () => void;
}

/** Centavos → texto da máscara (`32,90`), sem o símbolo de moeda. */
function centsToInput(cents: number): string {
  return formatBRL(cents).replace("R$", "").trim();
}

export function ProductForm({
  vitrineId,
  product,
  categories,
  brandSuggestions,
  onSaved,
  onLimitReached,
}: Props) {
  const t = useTranslations("produtos");
  const isEdit = !!product;
  const { initialDraft, save, clear } = useProductDraft(vitrineId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product
      ? {
          name: product.name,
          price: centsToInput(product.price_cents),
          promoPrice:
            product.promo_price_cents != null ? centsToInput(product.promo_price_cents) : "",
          description: product.description ?? "",
          isAvailable: product.is_available,
          categoryId: product.category_id ?? "",
          brandName: product.brand_name ?? "",
          imageUrl: product.cover_url ?? "",
        }
      : {
          name: initialDraft?.name ?? "",
          price: initialDraft?.price ?? "",
          promoPrice: "",
          description: initialDraft?.description ?? "",
          isAvailable: true,
          categoryId: "",
          brandName: "",
          imageUrl: initialDraft?.imageUrl ?? "",
        },
  });

  const name = watch("name");
  const price = watch("price");
  const description = watch("description") ?? "";
  const imageUrl = watch("imageUrl") ?? "";
  const isAvailable = watch("isAvailable");
  const categoryId = watch("categoryId") ?? "";

  // Avisa uma vez se havia rascunho recuperado (só na criação).
  const announced = useRef(false);
  useEffect(() => {
    if (!isEdit && !announced.current && initialDraft) {
      announced.current = true;
      toast.info(t("draftRecovered"));
    }
  }, [isEdit, initialDraft, t]);

  // Auto-save (~5s) — apenas na criação; a edição parte do produto real.
  useEffect(() => {
    if (isEdit) return;
    save({ name, price, description, imageUrl });
  }, [isEdit, name, price, description, imageUrl, save]);

  const priceReg = register("price");
  const promoReg = register("promoPrice");

  function formatPriceField(field: "price" | "promoPrice", value: string) {
    const cents = parseBRLToCents(value);
    if (cents !== null) setValue(field, centsToInput(cents), { shouldValidate: true });
  }

  async function onSubmit(values: ProductFormValues) {
    const priceCents = parseBRLToCents(values.price);
    if (priceCents === null) return; // o schema já garante; satisfaz o TS
    const promoRaw = values.promoPrice?.trim() ?? "";
    const promoPriceCents = promoRaw === "" ? null : parseBRLToCents(promoRaw);

    const payload = {
      name: values.name,
      description: values.description ?? "",
      priceCents,
      promoPriceCents,
      isAvailable: values.isAvailable,
      categoryId: values.categoryId ? values.categoryId : null,
      brandName: values.brandName ?? "",
      imageUrl: values.imageUrl,
    };

    const result = isEdit
      ? await updateProductAction(product.id, payload)
      : await createProductAction(payload);

    if (!result.ok) {
      if (result.code === "PLAN_LIMIT_REACHED") {
        onLimitReached();
        return;
      }
      toast.error(result.error ?? t("genericError"));
      return;
    }

    if (!isEdit) clear();
    toast.success(isEdit ? t("updated") : t("created"));
    onSaved(result.product!);
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="price">{t("priceLabel")}</Label>
          <Input
            id="price"
            inputMode="decimal"
            placeholder={t("pricePlaceholder")}
            {...priceReg}
            onBlur={(e) => {
              priceReg.onBlur(e);
              formatPriceField("price", e.target.value);
            }}
          />
          <FieldError message={errors.price?.message} />
        </div>

        <div>
          <Label htmlFor="promoPrice">{t("promoLabel")}</Label>
          <Input
            id="promoPrice"
            inputMode="decimal"
            placeholder={t("promoPlaceholder")}
            {...promoReg}
            onBlur={(e) => {
              promoReg.onBlur(e);
              formatPriceField("promoPrice", e.target.value);
            }}
          />
          <FieldError message={errors.promoPrice?.message} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="categoryId">{t("categoryLabel")}</Label>
          <Select
            value={categoryId === "" ? NO_CATEGORY : categoryId}
            onValueChange={(v) => setValue("categoryId", v === NO_CATEGORY ? "" : v)}
          >
            <SelectTrigger id="categoryId">
              <SelectValue placeholder={t("categoryNone")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_CATEGORY}>{t("categoryNone")}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="brandName">{t("brandLabel")}</Label>
          <Input
            id="brandName"
            list="brand-options"
            placeholder={t("brandPlaceholder")}
            {...register("brandName")}
          />
          <datalist id="brand-options">
            {brandSuggestions.map((brand) => (
              <option key={brand} value={brand} />
            ))}
          </datalist>
          <FieldError message={errors.brandName?.message} />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-md border px-3 py-2">
        <Label htmlFor="isAvailable" className="cursor-pointer">
          {t("availableLabel")}
        </Label>
        <Switch
          id="isAvailable"
          checked={isAvailable}
          onCheckedChange={(checked) => setValue("isAvailable", checked, { shouldDirty: true })}
        />
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
        {isSubmitting ? t("saving") : isEdit ? t("saveEdit") : t("save")}
      </Button>
    </form>
  );
}
