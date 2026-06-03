import { createClient } from "@supabase/supabase-js";

import { clientEnv, serverEnv } from "@/lib/env";
import type { Database } from "@/types/supabase";

/**
 * Cliente Supabase com a SERVICE ROLE KEY — **bypassa RLS**.
 *
 * ⚠️ Usar SOMENTE em código de servidor e SEMPRE com colunas explícitas. Na
 * vitrine pública (#0012) serve só para ler os campos públicos do perfil da dona
 * (`profiles` não tem RLS de leitura pública — ver migration de RLS #0004). Nunca
 * exponha este cliente nem a chave ao browser.
 *
 * Sem sessão/cookies de propósito: assim a rota da vitrine continua elegível a ISR.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient só pode ser usado no servidor.");
  }
  return createClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL!,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
