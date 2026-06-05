import { type NextRequest, NextResponse } from "next/server";

import { sanitizeNext } from "@/lib/auth/redirect";
import { REFERRAL_COOKIE, normalizeReferralCode } from "@/lib/referrals";
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
      const response = NextResponse.redirect(new URL(next, origin));

      // Indicação (#0020): no OAuth o metadata não chega ao trigger, então
      // aplicamos o código capturado (cookie) agora que a sessão existe. A RPC só
      // promove conta nova (Free/recém-criada). Best-effort — nunca bloqueia o login.
      const referralCode = normalizeReferralCode(request.cookies.get(REFERRAL_COOKIE)?.value);
      if (referralCode) {
        try {
          await supabase.rpc("apply_referral", { p_code: referralCode });
        } catch {
          // segue o login mesmo se a indicação falhar
        }
        response.cookies.delete(REFERRAL_COOKIE);
      }

      return response;
    }
  }

  return NextResponse.redirect(new URL("/login?erro=oauth", origin));
}
