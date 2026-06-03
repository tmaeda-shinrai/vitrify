import type { MetadataRoute } from "next";

import { clientEnv } from "@/lib/env";

/** Libera as vitrines públicas e bloqueia as rotas internas do app. */
export default function robots(): MetadataRoute.Robots {
  const base = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/produtos",
        "/pedidos",
        "/estatisticas",
        "/conta",
        "/onboarding",
        "/api/",
        "/auth/",
        "/login",
        "/cadastro",
        "/recuperar-senha",
        "/redefinir-senha",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
