import { type NextRequest } from "next/server";

import { REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE, normalizeReferralCode } from "@/lib/referrals";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Captura do `?ref=` do programa de indicação (#0020): guarda em cookie httpOnly
  // para sobreviver à navegação (o link aponta para a raiz) até o cadastro/callback.
  // 1ª indicação capturada "ganha" — não sobrescreve um código já pendente.
  const ref = normalizeReferralCode(request.nextUrl.searchParams.get("ref"));
  if (ref && !request.cookies.get(REFERRAL_COOKIE)) {
    response.cookies.set(REFERRAL_COOKIE, ref, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: REFERRAL_COOKIE_MAX_AGE,
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Casa todas as rotas, exceto:
     * - _next/static, _next/image (assets do Next)
     * - favicon.ico, robots.txt, sitemap.xml
     * - arquivos com extensão (imagens, fontes etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.[\\w]+$).*)",
  ],
};
