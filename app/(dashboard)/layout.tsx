import { Suspense } from "react";
import { redirect } from "next/navigation";

import { DesktopSidebar } from "@/components/dashboard/desktop-sidebar";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";
import { WelcomeTour } from "@/components/help/welcome-tour";
import { PlanWelcome } from "@/components/plan/plan-welcome";
import { InstallPrompt } from "@/components/shared/install-prompt";
import { LegalFooter } from "@/components/shared/legal-footer";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Guarda de rota autenticada.
  if (!user) redirect("/login");

  // Onboarding incompleto vai para o fluxo de onboarding (#0008).
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed_at, blocked_at")
    .eq("id", user.id)
    .maybeSingle();

  // Conta suspensa pela moderação (#0023): derruba a sessão com mensagem neutra.
  if (profile?.blocked_at) {
    await supabase.auth.signOut();
    redirect("/login?erro=conta-suspensa");
  }

  if (!profile?.onboarding_completed_at) redirect("/onboarding");

  return (
    <div className="flex min-h-dvh">
      <DesktopSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-4 py-6 pb-20 md:px-8 md:pb-8">{children}</main>
        <LegalFooter className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 pb-24 pt-4 text-center text-xs text-muted-foreground md:pb-8" />
      </div>
      <MobileBottomNav />
      <InstallPrompt />
      <PlanWelcome />
      <Suspense>
        <WelcomeTour />
      </Suspense>
    </div>
  );
}
