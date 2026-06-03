"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

/**
 * Carrossel das fotos do produto no modal. Scroll-snap nativo (sem dependência),
 * com setas e dots quando há mais de uma foto. A 1ª imagem carrega eager; as
 * demais lazy. Animações respeitam `prefers-reduced-motion` (regra global).
 */
export function ProductCarousel({ images, alt }: { images: string[]; alt: string }) {
  const t = useTranslations("vitrine");
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-md bg-muted text-muted-foreground">
        <ImageOff className="size-10" />
      </div>
    );
  }

  function scrollToIndex(next: number) {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(next, images.length - 1));
    track.scrollTo({ left: track.clientWidth * clamped, behavior: "smooth" });
    setIndex(clamped);
  }

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    const current = Math.round(track.scrollLeft / track.clientWidth);
    if (current !== index) setIndex(current);
  }

  const multiple = images.length > 1;

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex aspect-square w-full snap-x snap-mandatory overflow-x-auto rounded-md bg-muted [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, i) => (
          <div key={src} className="relative aspect-square w-full shrink-0 snap-center">
            <Image
              src={src}
              alt={alt}
              fill
              priority={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
              sizes="(max-width: 640px) 100vw, 512px"
              className="object-cover"
              unoptimized
            />
          </div>
        ))}
      </div>

      {multiple ? (
        <>
          <button
            type="button"
            aria-label={t("prev")}
            onClick={() => scrollToIndex(index - 1)}
            disabled={index === 0}
            className="absolute left-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground shadow-sm disabled:opacity-40"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label={t("next")}
            onClick={() => scrollToIndex(index + 1)}
            disabled={index === images.length - 1}
            className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground shadow-sm disabled:opacity-40"
          >
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
            {images.map((src, i) => (
              <span
                key={src}
                className={cn(
                  "size-1.5 rounded-full bg-foreground/30",
                  i === index && "bg-foreground",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
