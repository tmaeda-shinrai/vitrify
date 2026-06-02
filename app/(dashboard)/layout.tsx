import { redirect } from "next/navigation";

import { DesktopSidebar } from "@/components/dashboard/desktop-sidebar";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";
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
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed_at) redirect("/onboarding");

  return (
    <div className="flex min-h-dvh">
      <DesktopSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-4 py-6 pb-20 md:px-8 md:pb-8">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
