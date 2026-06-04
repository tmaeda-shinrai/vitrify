import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * E-mail da usuária via service role (`auth.users` não é exposto por RLS). Usado por
 * webhook/cron para os e-mails transacionais (#0019). `null` se não encontrar.
 */
export async function getUserEmail(
  admin: AdminClient,
  userId: string | null | undefined,
): Promise<string | null> {
  if (!userId) return null;
  const { data } = await admin.auth.admin.getUserById(userId);
  return data.user?.email ?? null;
}
