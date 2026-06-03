import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, setRequestLocale } from "next-intl/server";

import { QueryProvider } from "@/components/shared/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { defaultLocale } from "@/i18n";
import { clientEnv } from "@/lib/env";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: `${clientEnv.NEXT_PUBLIC_APP_NAME} — sua vitrine digital em um link`,
  description: "Monte sua vitrine, compartilhe o link nas redes e venda direto pelo WhatsApp.",
  applicationName: clientEnv.NEXT_PUBLIC_APP_NAME,
};

export const viewport: Viewport = {
  themeColor: "#7C3AED",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Fixa o locale (pt-BR) para o next-intl sem ler `headers()`, mantendo as rotas
  // que não usam cookies elegíveis a render estático/ISR — ex.: a vitrine #0012.
  setRequestLocale(defaultLocale);

  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${display.variable}`}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>{children}</QueryProvider>
          <Toaster richColors closeButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
