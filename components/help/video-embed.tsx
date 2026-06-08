"use client";

import { useState } from "react";
import { Play, Video } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Embed de YouTube com facade (#0022): mostra só a thumbnail até o clique — o iframe
 * (youtube-nocookie) só carrega ao tocar em play, sem cookies antes (alinhado ao
 * cookieless do #0021). `youtubeId` nulo → placeholder "em breve".
 */
export function VideoEmbed({ youtubeId, title }: { youtubeId: string | null; title: string }) {
  const t = useTranslations("videoEmbed");
  const [playing, setPlaying] = useState(false);

  if (!youtubeId) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted text-muted-foreground">
        <Video className="size-6" aria-hidden />
        <span className="text-sm">{t("comingSoon")}</span>
      </div>
    );
  }

  if (playing) {
    return (
      <iframe
        className="aspect-video w-full rounded-lg"
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`}
        title={title}
        allow="accelerated-display; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={t("play", { title })}
      className="group relative aspect-video w-full overflow-hidden rounded-lg bg-black"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
        alt=""
        className="size-full object-cover opacity-90 transition group-hover:opacity-100"
        loading="lazy"
      />
      <span className="absolute inset-0 grid place-content-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg transition group-hover:scale-105">
          <Play className="size-6 translate-x-0.5 fill-current" aria-hidden />
        </span>
      </span>
    </button>
  );
}
