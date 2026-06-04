/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import { CacheFirst, ExpirationPlugin, Serwist } from "serwist";

// Service worker do PWA (#0017), compilado para public/sw.js pelo @serwist/next.
// `defaultCache` traz as estratégias recomendadas para o App Router do Next
// (NetworkFirst para páginas/RSC → última versão da vitrine e do painel offline;
// CacheFirst para estáticos). Acrescentamos o cache das imagens do Supabase
// Storage para a vitrine abrir com fotos mesmo sem internet.

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const supabaseImageCache: RuntimeCaching = {
  matcher: ({ url, request }) =>
    request.destination === "image" &&
    (url.hostname.endsWith(".supabase.co") || url.hostname.endsWith(".supabase.in")),
  handler: new CacheFirst({
    cacheName: "supabase-images",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 128,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 dias
        maxAgeFrom: "last-used",
      }),
    ],
  }),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [supabaseImageCache, ...defaultCache],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();
