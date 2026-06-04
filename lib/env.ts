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
});

const clientParsed = clientSchema.safeParse(process.env);
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
