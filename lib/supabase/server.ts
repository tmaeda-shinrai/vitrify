import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { clientEnv } from "@/lib/env";
import type { Database } from "@/types/supabase";

/**
 * Cliente Supabase para código de servidor (Server Components, Server Actions,
 * Route Handlers). Lê/escreve a sessão nos cookies da request via @supabase/ssr.
 *
 * Em Server Components o `set`/`remove` de cookies pode lançar — ignoramos, pois
 * a renovação dos cookies acontece no middleware (`updateSession`).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL!,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Chamado de um Server Component sem acesso a escrita de cookies.
            // O middleware cuida da renovação da sessão.
          }
        },
      },
    },
  );
}
