import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Rocket } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Onboarding" };

/**
 * Stub do onboarding (#0008 substitui o conteúdo). Fica FORA do grupo
 * (dashboard) para não recursar na guarda que redireciona para cá.
 */
export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  // Já concluiu o onboarding: vai direto para o painel.
  if (profile?.onboarding_completed_at) redirect("/produtos");

  const t = await getTranslations("dashboard");

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <EmptyState
          icon={Rocket}
          title={t("onboardingStubTitle")}
          description={t("onboardingStubDescription")}
        />
      </div>
    </main>
  );
}
