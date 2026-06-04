import { withSentryConfig } from "@sentry/nextjs";
import withSerwistInit from "@serwist/next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

// PWA / service worker (#0017). Desabilitado em dev para não atrapalhar o HMR;
// o SW (app/sw.ts) é compilado para public/sw.js só no build de produção.
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Habilita instrumentation.ts (carrega o Sentry server/edge) no Next 14.
  experimental: { instrumentationHook: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
  },
};

const config = withSerwist(withNextIntl(nextConfig));

// Sentry (#0017): injeta a instrumentação do client/server. Upload de source
// maps só quando há SENTRY_AUTH_TOKEN (CI/prod); no-op sem DSN (dev/local).
export default withSentryConfig(config, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
