import { getRequestConfig } from "next-intl/server";

export const defaultLocale = "pt-BR" as const;
export const locales = ["pt-BR"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => ({
  locale: defaultLocale,
  messages: (await import("./messages/pt-BR.json")).default,
}));
