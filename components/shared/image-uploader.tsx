"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { ImagePlus, Loader2, UserRound } from "lucide-react";
import Cropper, { type Area } from "react-easy-crop";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCroppedBlob } from "@/lib/crop";
import {
  ALLOWED_IMAGE_TYPES,
  IMAGE_COMPRESSION,
  isAllowedImageType,
  OUTPUT_IMAGE_TYPE,
  type SignedUpload,
} from "@/lib/image";
import { createClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value: string | null;
  onUploaded: (url: string) => void;
  /** Server Action que assina o upload (já define bucket + pasta da dona). */
  createUploadUrl: () => Promise<SignedUpload>;
  /** Bucket de destino — precisa casar com o usado na signed URL. */
  bucket: string;
  /** Forma do recorte e da prévia: redonda (avatar) ou quadrada (produto). */
  shape?: "round" | "square";
  /** Sobrescreve o texto do botão (default vem do i18n). */
  label?: string;
}

export function ImageUploader({
  value,
  onUploaded,
  createUploadUrl,
  bucket,
  shape = "round",
  label,
}: ImageUploaderProps) {
  const t = useTranslations("imageUploader");
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const rounded = shape === "round";
  const onCropComplete = useCallback((_: Area, area: Area) => setAreaPixels(area), []);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite re-selecionar o mesmo arquivo
    if (!file) return;
    if (!isAllowedImageType(file.type)) {
      toast.error(t("typeError"));
      return;
    }
    setImageSrc(URL.createObjectURL(file));
  }

  async function handleSave() {
    if (!imageSrc || !areaPixels) return;
    setSaving(true);
    try {
      const cropped = await getCroppedBlob(imageSrc, areaPixels);
      const compressed = await imageCompression(
        new File([cropped], `image.${OUTPUT_IMAGE_TYPE.split("/")[1]}`, {
          type: OUTPUT_IMAGE_TYPE,
        }),
        { ...IMAGE_COMPRESSION, fileType: OUTPUT_IMAGE_TYPE },
      );

      const signed = await createUploadUrl();
      if (!signed.ok || !signed.path || !signed.token || !signed.publicUrl) {
        throw new Error(signed.error);
      }

      const supabase = createClient();
      const { error } = await supabase.storage
        .from(bucket)
        .uploadToSignedUrl(signed.path, signed.token, compressed, {
          contentType: OUTPUT_IMAGE_TYPE,
        });
      if (error) throw error;

      onUploaded(signed.publicUrl);
      toast.success(t("saved"));
      closeDialog();
    } catch {
      toast.error(t("uploadError"));
    } finally {
      setSaving(false);
    }
  }

  function closeDialog() {
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  }

  return (
    <div className="flex items-center gap-4">
      {value ? (
        <Image
          src={value}
          alt=""
          width={72}
          height={72}
          className={cn("size-[72px] object-cover", rounded ? "rounded-full" : "rounded-md")}
          unoptimized
        />
      ) : (
        <div
          className={cn(
            "flex size-[72px] items-center justify-center bg-muted text-muted-foreground",
            rounded ? "rounded-full" : "rounded-md",
          )}
        >
          {rounded ? <UserRound className="size-8" /> : <ImagePlus className="size-8" />}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={onPick}
      />
      <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
        {label ?? (value ? t("change") : t("add"))}
      </Button>

      <Dialog open={!!imageSrc} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("cropTitle")}</DialogTitle>
          </DialogHeader>
          <div className="relative h-64 w-full overflow-hidden rounded-md bg-muted">
            {imageSrc ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape={rounded ? "round" : "rect"}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            ) : null}
          </div>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label={t("zoom")}
            className="w-full"
          />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={closeDialog} disabled={saving}>
              {t("cancel")}
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving || !areaPixels}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
