import { type NextRequest, NextResponse } from "next/server";

import { sanitizeNext } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback do OAuth (Google). O provider redireciona para cá com `code` (sucesso)
 * ou `error` (usuária cancelou o consentimento). Troca o code por sessão e segue
 * para `next`. No primeiro login o trigger handle_new_user (#0003) cria
 * profile + subscription free + vitrine inativa.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");
  const next = sanitizeNext(searchParams.get("next"));

  if (oauthError) {
    return NextResponse.redirect(new URL("/login?erro=oauth-cancelado", origin));
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL("/login?erro=oauth", origin));
}
