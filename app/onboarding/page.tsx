import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { clientEnv } from "@/lib/env";
import { TERMS_VERSION } from "@/lib/legal/version";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Vamos montar sua vitrine" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: vitrine }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, whatsapp, onboarding_completed_at, terms_version, terms_accepted_at")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("vitrines")
      .select("slug")
      .eq("owner_id", user.id)
      .eq("is_default", true)
      .maybeSingle(),
  ]);

  // Já concluiu: vai direto para o painel.
  if (profile?.onboarding_completed_at) redirect("/produtos");

  const slugChosen = Boolean(vitrine?.slug && !vitrine.slug.startsWith("u-"));
  const initialStep = slugChosen ? (profile?.whatsapp ? 4 : 3) : 1;

  const meta = user.user_metadata ?? {};
  const googleAvatarUrl =
    typeof meta.avatar_url === "string"
      ? meta.avatar_url
      : typeof meta.picture === "string"
        ? meta.picture
        : null;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center font-display text-2xl font-bold text-primary">
          {clientEnv.NEXT_PUBLIC_APP_NAME}
        </p>
        <OnboardingWizard
          data={{
            fullName: profile?.full_name ?? "",
            whatsapp: profile?.whatsapp ?? "",
            googleAvatarUrl,
          }}
          initialStep={initialStep}
          needsTerms={!profile?.terms_accepted_at || profile.terms_version !== TERMS_VERSION}
        />
      </div>
    </main>
  );
}
