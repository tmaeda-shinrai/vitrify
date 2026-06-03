import { createClient } from "@supabase/supabase-js";

import { clientEnv } from "@/lib/env";
import type { Database } from "@/types/supabase";

/**
 * Cliente Supabase público (anon key) SEM sessão/cookies. Respeita a RLS pública
 * (lê itens ativos de vitrines ativas). Por não tocar em cookies, mantém a rota
 * da vitrine elegível a ISR (`revalidate`). Usar só para leitura pública no server.
 */
export function createPublicClient() {
  return createClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL!,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
