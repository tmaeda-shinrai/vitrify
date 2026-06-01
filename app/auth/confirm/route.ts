import { type NextRequest, NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";

import { sanitizeNext } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

/**
 * Troca o token de e-mail (confirmação de cadastro ou recuperação) por uma
 * sessão. Ponto único de uso único e expiração 1h (config.toml otp_expiry=3600).
 * Links: /auth/confirm?token_hash=...&type=signup|recovery&next=/...
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = sanitizeNext(searchParams.get("next"));

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL("/login?erro=link-invalido", origin));
}
