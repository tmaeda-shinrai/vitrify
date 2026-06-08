"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ProductImage } from "@/lib/products";

export interface ProductDraft {
  name: string;
  price: string;
  description: string;
  images: ProductImage[];
}

const EMPTY: ProductDraft = { name: "", price: "", description: "", images: [] };
const AUTOSAVE_MS = 5000;

function keyFor(vitrineId: string) {
  return `vitrinio:product-draft:${vitrineId}`;
}

function isEmpty(draft: ProductDraft) {
  return !draft.name && !draft.price && !draft.description && draft.images.length === 0;
}

function readDraft(vitrineId: string): ProductDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(keyFor(vitrineId));
    if (!raw) return null;
    const data = JSON.parse(raw) as Record<string, unknown>;
    // Migra o formato antigo (string[] de URLs) para o novo ({ url, alt }), para
    // não quebrar rascunhos já salvos; descarta entradas sem URL.
    const rawImages = Array.isArray(data.images) ? (data.images as unknown[]) : [];
    const images: ProductImage[] = rawImages
      .map((img) =>
        typeof img === "string"
          ? { url: img, alt: "" }
          : {
              url: typeof (img as ProductImage)?.url === "string" ? (img as ProductImage).url : "",
              alt: typeof (img as ProductImage)?.alt === "string" ? (img as ProductImage).alt : "",
            },
      )
      .filter((img) => img.url);
    const parsed: ProductDraft = {
      name: typeof data.name === "string" ? data.name : "",
      price: typeof data.price === "string" ? data.price : "",
      description: typeof data.description === "string" ? data.description : "",
      images,
    };
    return isEmpty(parsed) ? null : parsed;
  } catch {
    return null; // rascunho corrompido/indisponível
  }
}

/**
 * Auto-save do rascunho do produto em localStorage (DESIGN §4.3): grava ~5s após a
 * última mudança e recupera ao reabrir o formulário. `initialDraft` é lido uma vez
 * no mount (síncrono, client-only — o form só monta dentro do Sheet aberto).
 */
export function useProductDraft(vitrineId: string) {
  const [initialDraft] = useState<ProductDraft | null>(() => readDraft(vitrineId));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    (draft: ProductDraft) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        try {
          if (isEmpty(draft)) window.localStorage.removeItem(keyFor(vitrineId));
          else window.localStorage.setItem(keyFor(vitrineId), JSON.stringify(draft));
        } catch {
          // storage cheio/indisponível — ignora
        }
      }, AUTOSAVE_MS);
    },
    [vitrineId],
  );

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    try {
      window.localStorage.removeItem(keyFor(vitrineId));
    } catch {
      // ignora
    }
  }, [vitrineId]);

  // Limpa o timer pendente ao desmontar.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { initialDraft, save, clear };
}
