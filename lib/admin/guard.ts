import { serverEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Guarda da área administrativa (#0023). Acesso restrito aos e-mails de
 * `ADMIN_EMAILS` (lista separada por vírgula). Tudo aqui roda só no servidor;
 * a leitura/escrita admin usa o service role (`lib/supabase/admin`).
 */

/** `true` se `email` está em `adminEmails` (case-insensitive, trim). Lista vazia → ninguém. */
export function isAdminEmail(
  email: string | null | undefined,
  adminEmails: string | undefined,
): boolean {
  if (!email) return false;
  const target = email.trim().toLowerCase();
  if (!target) return false;
  return (adminEmails ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(target);
}

/**
 * Retorna o usuário admin logado, ou `null` se não houver sessão ou o e-mail não
 * estiver em `ADMIN_EMAILS`. Usado pelo layout `/admin` e pelas Server Actions.
 */
export async function getAdminUser(): Promise<{ id: string; email: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !isAdminEmail(user.email, serverEnv.ADMIN_EMAILS)) return null;
  return { id: user.id, email: user.email };
}
