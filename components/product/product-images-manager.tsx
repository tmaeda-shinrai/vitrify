"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Star, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { createProductImageUploadUrl } from "@/app/(dashboard)/produtos/actions";
import { ImageUploader } from "@/components/shared/image-uploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRODUCT_IMAGES_MAX } from "@/lib/validators/product";

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
}

/** Gerencia até 5 fotos: adicionar, definir capa (índice 0), reordenar e remover. */
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

  return (
    <div className="space-y-3">
      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-3">
          {value.map((url, index) => (
            <li key={url}>
              <div className="relative size-20 overflow-hidden rounded-md border bg-muted">
                <Image src={url} alt="" fill sizes="80px" className="object-cover" unoptimized />
                {index === 0 ? (
                  <Badge className="absolute left-1 top-1 px-1 py-0 text-[10px]">
                    {t("cover")}
                  </Badge>
                ) : null}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={t("removePhoto")}
                  className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <X className="size-3" />
                </button>
              </div>
              <div className="mt-1 flex items-center justify-center gap-0.5">
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
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {value.length < PRODUCT_IMAGES_MAX ? (
        <ImageUploader
          value={null}
          onUploaded={(url) => onChange([...value, url])}
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
