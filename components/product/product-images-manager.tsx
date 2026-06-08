"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Star, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { createProductImageUploadUrl } from "@/app/(dashboard)/produtos/actions";
import { ImageUploader } from "@/components/shared/image-uploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductImage } from "@/lib/products";
import { IMAGE_ALT_MAX, PRODUCT_IMAGES_MAX } from "@/lib/validators/product";

interface Props {
  value: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}

/**
 * Gerencia até 5 fotos: adicionar, definir capa (índice 0), reordenar, remover e
 * descrever (texto alternativo de acessibilidade, #0024). O `alt` é opcional — quando
 * em branco, a vitrine usa o nome do produto como fallback.
 */
export function ProductImagesManager({ value, onChange }: Props) {
  const t = useTranslations("produtos");

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  }

  function makeCover(index: number) {
    if (index === 0) return;
    const next = [...value];
    const [picked] = next.splice(index, 1);
    next.unshift(picked!);
    onChange(next);
  }

  function setAlt(index: number, alt: string) {
    onChange(value.map((img, i) => (i === index ? { ...img, alt } : img)));
  }

  return (
    <div className="space-y-3">
      {value.length > 0 ? (
        <ul className="space-y-2">
          {value.map((img, index) => (
            <li key={img.url} className="flex items-center gap-2 rounded-md border p-2">
              <div className="relative size-16 shrink-0 overflow-hidden rounded bg-muted">
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                  unoptimized
                />
                {index === 0 ? (
                  <Badge className="absolute left-0.5 top-0.5 px-1 py-0 text-[10px]">
                    {t("cover")}
                  </Badge>
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <Input
                  value={img.alt}
                  onChange={(e) => setAlt(index, e.target.value)}
                  maxLength={IMAGE_ALT_MAX}
                  placeholder={t("altPlaceholder")}
                  aria-label={t("altLabel", { number: index + 1 })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={index === 0}
                  aria-label={t("movePhotoLeft")}
                  onClick={() => move(index, -1)}
                >
                  <ArrowLeft className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={index === 0}
                  aria-label={t("makeCover")}
                  onClick={() => makeCover(index)}
                >
                  <Star className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={index === value.length - 1}
                  aria-label={t("movePhotoRight")}
                  onClick={() => move(index, 1)}
                >
                  <ArrowRight className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive hover:text-destructive"
                  aria-label={t("removePhoto")}
                  onClick={() => remove(index)}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {value.length < PRODUCT_IMAGES_MAX ? (
        <ImageUploader
          value={null}
          onUploaded={(url) => onChange([...value, { url, alt: "" }])}
          createUploadUrl={createProductImageUploadUrl}
          bucket="products"
          shape="square"
        />
      ) : (
        <p className="text-xs text-muted-foreground">{t("maxPhotos")}</p>
      )}

      <p className="text-xs text-muted-foreground">{t("photosHint")}</p>
    </div>
  );
}
