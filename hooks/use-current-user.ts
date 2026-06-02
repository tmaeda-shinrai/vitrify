"use client";

import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/browser";
import type { Database } from "@/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];
type VitrineRow = Database["public"]["Tables"]["vitrines"]["Row"];

export interface CurrentUser {
  id: string;
  email: string | null;
  profile: Pick<ProfileRow, "full_name" | "avatar_url" | "onboarding_completed_at"> | null;
  subscription: Pick<SubscriptionRow, "plan" | "status"> | null;
  vitrine: Pick<VitrineRow, "id" | "slug" | "title" | "is_active"> | null;
}

/**
 * Dados da usuária logada para o painel: profile + assinatura + vitrine padrão.
 * RLS já restringe cada select ao dono; mesmo assim filtramos por owner.
 */
export function useCurrentUser() {
  return useQuery<CurrentUser | null>({
    queryKey: ["current-user"],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const [profileRes, subscriptionRes, vitrineRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, avatar_url, onboarding_completed_at")
          .eq("id", user.id)
          .maybeSingle(),
        supabase.from("subscriptions").select("plan, status").eq("owner_id", user.id).maybeSingle(),
        supabase
          .from("vitrines")
          .select("id, slug, title, is_active")
          .eq("owner_id", user.id)
          .order("is_default", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      return {
        id: user.id,
        email: user.email ?? null,
        profile: profileRes.data,
        subscription: subscriptionRes.data,
        vitrine: vitrineRes.data,
      };
    },
  });
}
