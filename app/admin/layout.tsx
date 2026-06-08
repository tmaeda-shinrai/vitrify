import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AdminNav } from "@/components/admin/admin-nav";
import { getAdminUser } from "@/lib/admin/guard";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

/**
 * Área administrativa (#0023). Guarda dupla: sem sessão → /login; e-mail fora de
 * `ADMIN_EMAILS` → 404 neutro (não revela a existência da rota). Fora do grupo
 * `(dashboard)` — shell próprio, sem a navegação da dona.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = await getAdminUser();
  if (!admin) notFound();

  return (
    <div className="mx-auto min-h-dvh max-w-5xl px-4 py-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">Vitrinio · Admin</h1>
        <span className="text-xs text-muted-foreground">{admin.email}</span>
      </header>
      <AdminNav />
      <main className="py-6">{children}</main>
    </div>
  );
}
