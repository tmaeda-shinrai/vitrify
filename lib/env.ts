import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";
const requiredInProd = <T extends z.ZodTypeAny>(schema: T) => (isProd ? schema : schema.optional());

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  SUPABASE_SERVICE_ROLE_KEY: requiredInProd(z.string().min(20)),
  SUPABASE_PROJECT_REF: requiredInProd(z.string().min(1)),
  SUPABASE_DB_PASSWORD: z.string().optional(),

  ASAAS_API_URL: requiredInProd(z.string().url()),
  ASAAS_API_KEY: requiredInProd(z.string().min(1)),
  ASAAS_WEBHOOK_SECRET: requiredInProd(z.string().min(32)),
  ASAAS_PLAN_PRO_MONTHLY_ID: z.string().optional(),
  ASAAS_PLAN_PRO_YEARLY_ID: z.string().optional(),
  ASAAS_PLAN_PLUS_MONTHLY_ID: z.string().optional(),
  ASAAS_PLAN_PLUS_YEARLY_ID: z.string().optional(),

  // NF-e (#0025): `asaas` liga o módulo de NF-e do Asaas; `none` (padrão) → cron no-op.
  FISCAL_PROVIDER: z.enum(["asaas", "none"]).default("none"),
  ASAAS_MUNICIPAL_SERVICE_CODE: z.string().optional(),

  RESEND_API_KEY: requiredInProd(z.string().min(1)),
  EMAIL_FROM: requiredInProd(z.string().min(1)),
  EMAIL_REPLY_TO: requiredInProd(z.string().email()),

  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),

  UPSTASH_REDIS_REST_URL: requiredInProd(z.string().url()),
  UPSTASH_REDIS_REST_TOKEN: requiredInProd(z.string().min(1)),

  CRON_SECRET: z.string().min(16).optional(),
  ADMIN_EMAILS: z.string().optional(),
  DEBUG_MODE: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  LIMIT_FREE_PRODUCTS: z.coerce.number().int().positive().default(5),
  LIMIT_PRO_PRODUCTS: z.coerce.number().int().positive().default(999),
  LIMIT_PLUS_VITRINES: z.coerce.number().int().positive().default(3),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Vitrinio"),
  NEXT_PUBLIC_SUPABASE_URL: requiredInProd(z.string().url()),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requiredInProd(z.string().min(20)),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
  // Suporte e conteúdo (#0022). WhatsApp em E.164 sem '+'; vídeos por YouTube id.
  NEXT_PUBLIC_SUPPORT_WHATSAPP: z.string().optional(),
  NEXT_PUBLIC_SUPPORT_EMAIL: z.string().default("suporte@vitrinio.com.br"),
  NEXT_PUBLIC_INTRO_VIDEO_ID: z.string().optional(),
});

// O Next só substitui acessos diretos a `process.env.NEXT_PUBLIC_*` no bundle do
// cliente — o objeto `process.env` "bare" fica sem essas chaves. Por isso montamos
// o objeto explicitamente (cada acesso vira o valor no build); `safeParse(process.env)`
// no cliente devolveria tudo `undefined`.
const clientParsed = clientSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
  NEXT_PUBLIC_SUPPORT_WHATSAPP: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP,
  NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
  NEXT_PUBLIC_INTRO_VIDEO_ID: process.env.NEXT_PUBLIC_INTRO_VIDEO_ID,
});
if (!clientParsed.success) {
  console.error("Variáveis NEXT_PUBLIC_* inválidas:", clientParsed.error.flatten().fieldErrors);
  throw new Error("Configuração de ambiente (cliente) inválida. Verifique .env.local.");
}

const serverParsed = typeof window === "undefined" ? serverSchema.safeParse(process.env) : null;

if (serverParsed && !serverParsed.success) {
  console.error(
    "Variáveis de ambiente de servidor inválidas:",
    serverParsed.error.flatten().fieldErrors,
  );
  throw new Error("Configuração de ambiente (servidor) inválida. Verifique .env.local.");
}

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

export const clientEnv: ClientEnv = clientParsed.data;

export const serverEnv: ServerEnv = new Proxy({} as ServerEnv, {
  get(_target, key: string) {
    if (typeof window !== "undefined") {
      throw new Error(
        `Tentativa de ler serverEnv.${key} no cliente. Use clientEnv ou mova o código para Server Component / Route Handler.`,
      );
    }
    return (serverParsed!.data as Record<string, unknown>)[key];
  },
});
