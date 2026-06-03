"use client";

import { useEffect } from "react";

import { recordVitrineView } from "@/lib/view";

/** Dispara a contagem de view da vitrine no carregamento (#0015 PR2). Renderiza nada. */
export function VitrineViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    recordVitrineView(slug);
  }, [slug]);
  return null;
}
