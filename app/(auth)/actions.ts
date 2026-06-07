"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { DEFAULT_REDIRECT, sanitizeNext } from "@/lib/auth/redirect";
import { clientEnv } from "@/lib/env";
import { TERMS_VERSION } from "@/lib/legal/version";
import { checkLoginRateLimit, getClientIp } from "@/lib/rate-limit";
import { REFERRAL_COOKIE, normalizeReferralCode } from "@/lib/referrals";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  newPasswordSchema,
  resetRequestSchema,
  signUpSchema,
} from "@/lib/validators/auth";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

function appUrl(path: string): string {
  return new URL(path, clientEnv.NEXT_PUBLIC_APP_URL).toString();
}

export async function signUpAction(input: unknown): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos. Confira os campos." };
  }

  const { fullName, email, password } = parsed.data;

  // Indicação (#0020): código capturado no cookie (middleware) → metadata; o trigger
  // handle_new_user concede 30 dias de Pro à indicada e registra o vínculo no signup.
  const cookieStore = await cookies();
  const referralCode = normalizeReferralCode(cookieStore.get(REFERRAL_COOKIE)?.value);

  const supabase = await createClient();

  // Aceite de termos (#0021): grava QUAL versão foi aceita e QUANDO via metadata →
  // o trigger handle_new_user persiste em profiles.terms_version/terms_accepted_at.
  const termsMeta = {
    terms_version: TERMS_VERSION,
    terms_accepted_at: new Date().toISOString(),
  };

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: referralCode
        ? { full_name: fullName, referral_code: referralCode, ...termsMeta }
        : { full_name: fullName, ...termsMeta },
      emailRedirectTo: appUrl(`/auth/confirm?next=${encodeURIComponent(DEFAULT_REDIRECT)}`),
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("registered")) {
      return { ok: false, error: "Este e-mail já está em uso." };
    }
    return { ok: false, error: "Não foi possível criar a conta. Tente novamente." };
  }

  // Consumido: o vínculo já foi criado pelo trigger no momento do signup.
  if (referralCode) cookieStore.delete(REFERRAL_COOKIE);

  return { ok: true };
}

export async function loginAction(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos. Confira os campos." };
  }

  const ip = getClientIp(await headers());
  const { success } = await checkLoginRateLimit(ip);
  if (!success) {
    return {
      ok: false,
      error: "Muitas tentativas de login. Aguarde 15 minutos e tente novamente.",
    };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        ok: false,
        error: "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.",
      };
    }
    return { ok: false, error: "E-mail ou senha incorretos." };
  }

  return { ok: true };
}

export async function requestResetAction(input: unknown): Promise<ActionResult> {
  const parsed = resetRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "E-mail inválido." };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: appUrl("/auth/confirm?type=recovery&next=/redefinir-senha"),
  });

  // Resposta neutra sempre (anti-enumeração de contas).
  return { ok: true };
}

export async function updatePasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = newPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos. Confira os campos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Link inválido ou expirado. Solicite a recuperação novamente." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { ok: false, error: "Não foi possível redefinir a senha. Tente novamente." };
  }

  return { ok: true };
}

export async function signInWithGoogleAction(next?: string): Promise<ActionResult> {
  const supabase = await createClient();
  const target = sanitizeNext(next);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: appUrl(`/auth/callback?next=${encodeURIComponent(target)}`),
    },
  });

  if (error || !data.url) {
    return { ok: false, error: "Não foi possível conectar com o Google. Tente novamente." };
  }

  // O code verifier (PKCE) foi gravado em cookie httpOnly pelo server client.
  redirect(data.url);
}

export async function logoutAction(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
