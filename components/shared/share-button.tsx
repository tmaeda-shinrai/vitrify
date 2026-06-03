"use client";

import { Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button, type ButtonProps } from "@/components/ui/button";

interface Props {
  url: string;
  title?: string;
  /** Texto do botão; padrão "Compartilhar". Com `size="icon"` o texto é omitido. */
  label?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}

/**
 * Compartilha um link via Web Share API (#0014); sem suporte, copia para a área de
 * transferência e mostra um toast. Cancelar o share (AbortError) não faz nada.
 */
export function ShareButton({ url, title, label, variant = "outline", size, className }: Props) {
  const t = useTranslations("common");
  const text = label ?? t("share");

  async function handleShare() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("linkCopied"));
    } catch {
      // sem clipboard disponível: silencioso.
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      aria-label={text}
      className={className}
      onClick={handleShare}
    >
      <Share2 className="size-4" />
      {size === "icon" ? null : text}
    </Button>
  );
}
