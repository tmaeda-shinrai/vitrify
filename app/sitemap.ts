import type { MetadataRoute } from "next";

import { clientEnv } from "@/lib/env";
import { getActiveVitrineSlugs } from "@/lib/vitrine-data";

/** Regera periodicamente para refletir vitrines novas/desativadas. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const slugs = await getActiveVitrineSlugs();
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...slugs.map((slug) => ({
      url: `${base}/${slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
