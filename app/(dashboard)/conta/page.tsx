import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ContaTabs } from "@/components/conta/conta-tabs";
import { DeleteAccount } from "@/components/conta/delete-account";
import { ProfileForm } from "@/components/conta/profile-form";
import { VitrineForm } from "@/components/conta/vitrine-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Conta" };

export default async function ContaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: vitrine }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, bio, whatsapp, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("vitrines")
      .select("slug, title, subtitle")
      .eq("owner_id", user.id)
      .eq("is_default", true)
      .maybeSingle(),
  ]);

  const t = await getTranslations("conta");

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
      <ContaTabs />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("profileSection")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            initial={{
              fullName: profile?.full_name ?? "",
              bio: profile?.bio ?? "",
              whatsapp: profile?.whatsapp ?? "",
              avatarUrl: profile?.avatar_url ?? null,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("vitrineSection")}</CardTitle>
        </CardHeader>
        <CardContent>
          <VitrineForm
            initial={{
              slug: vitrine?.slug ?? "",
              title: vitrine?.title ?? "",
              subtitle: vitrine?.subtitle ?? "",
            }}
          />
        </CardContent>
      </Card>

      <DeleteAccount />
    </div>
  );
}
