import type { MetadataRoute } from "next";

import { clientEnv } from "@/lib/env";

// Ícones gerados por scripts/generate-icons.mjs (#0017).
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const name = clientEnv.NEXT_PUBLIC_APP_NAME;

  return {
    name: `${name} — sua vitrine digital`,
    short_name: name,
    description: "Monte sua vitrine, compartilhe o link e venda direto pelo WhatsApp.",
    start_url: "/produtos",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "pt-BR",
    dir: "ltr",
    theme_color: "#7C3AED",
    background_color: "#F9FAFB",
    categories: ["business", "shopping"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Adicionar produto",
        short_name: "Novo produto",
        url: "/produtos?novo=1",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Ver vitrine",
        short_name: "Vitrine",
        url: "/minha-vitrine",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
