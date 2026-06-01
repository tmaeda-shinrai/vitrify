import { createBrowserClient } from "@supabase/ssr";

import { clientEnv } from "@/lib/env";
import type { Database } from "@/types/supabase";

/**
 * Cliente Supabase para código de browser ("use client"). Use através de hooks
 * TanStack Query; mutações que alteram estado vão por Server Actions.
 */
export function createClient() {
  return createBrowserClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL!,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
