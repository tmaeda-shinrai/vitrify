import { normalize } from "@/lib/search";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Leitura de contas para o admin (#0023) — service role, só servidor. O e-mail vem
 * de `auth.users` (não exposto por RLS), por isso usamos `admin.auth.admin`.
 * Escala de MVP: varremos até `USER_CAP` usuárias; paginação real fica como futuro.
 */
const USER_CAP = 1000;

export interface AdminAccountRow {
  id: string;
  email: string | null;
  fullName: string;
  plan: string | null;
  status: string | null;
  slug: string | null;
  vitrineActive: boolean | null;
  createdAt: string | null;
}

export interface AdminAccountDetail extends AdminAccountRow {
  whatsapp: string | null;
  bio: string | null;
  onboardingCompletedAt: string | null;
  deletionRequestedAt: string | null;
  vitrineId: string | null;
  vitrineTitle: string | null;
}

/** Map id→email de até USER_CAP usuárias do Auth. */
async function fetchEmailMap(
  admin: ReturnType<typeof createAdminClient>,
): Promise<Map<string, { email: string | null; createdAt: string | null }>> {
  const map = new Map<string, { email: string | null; createdAt: string | null }>();
  const perPage = 200;
  for (let page = 1; map.size < USER_CAP; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error || data.users.length === 0) break;
    for (const u of data.users) {
      map.set(u.id, { email: u.email ?? null, createdAt: u.created_at ?? null });
    }
    if (data.users.length < perPage) break;
  }
  return map;
}

/** Lista contas (perfil + plano + vitrine + e-mail), filtrando por `q` e limitando. */
export async function listAccounts(q?: string, limit = 50): Promise<AdminAccountRow[]> {
  const admin = createAdminClient();
  const [emailMap, { data: profiles }, { data: subs }, { data: vitrines }] = await Promise.all([
    fetchEmailMap(admin),
    admin.from("profiles").select("id, full_name, created_at").limit(USER_CAP),
    admin.from("subscriptions").select("owner_id, plan, status").limit(USER_CAP),
    admin
      .from("vitrines")
      .select("owner_id, slug, is_active")
      .eq("is_default", true)
      .limit(USER_CAP),
  ]);

  const subByOwner = new Map((subs ?? []).map((s) => [s.owner_id, s]));
  const vitByOwner = new Map((vitrines ?? []).map((v) => [v.owner_id, v]));

  const rows: AdminAccountRow[] = (profiles ?? []).map((p) => {
    const sub = subByOwner.get(p.id);
    const vit = vitByOwner.get(p.id);
    return {
      id: p.id,
      email: emailMap.get(p.id)?.email ?? null,
      fullName: p.full_name,
      plan: sub?.plan ?? null,
      status: sub?.status ?? null,
      slug: vit?.slug ?? null,
      vitrineActive: vit?.is_active ?? null,
      createdAt: p.created_at,
    };
  });

  const filtered = q
    ? rows.filter((r) => {
        const hay = normalize(`${r.fullName} ${r.email ?? ""} ${r.slug ?? ""}`);
        return hay.includes(normalize(q));
      })
    : rows;

  return filtered
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, limit);
}

/** Detalhe de uma conta por id (perfil + plano + vitrine + e-mail). */
export async function getAccount(id: string): Promise<AdminAccountDetail | null> {
  const admin = createAdminClient();
  const [{ data: profile }, { data: sub }, { data: vitrine }, userRes] = await Promise.all([
    admin
      .from("profiles")
      .select(
        "id, full_name, whatsapp, bio, created_at, onboarding_completed_at, deletion_requested_at",
      )
      .eq("id", id)
      .maybeSingle(),
    admin.from("subscriptions").select("plan, status").eq("owner_id", id).maybeSingle(),
    admin
      .from("vitrines")
      .select("id, slug, title, is_active")
      .eq("owner_id", id)
      .eq("is_default", true)
      .maybeSingle(),
    admin.auth.admin.getUserById(id),
  ]);

  if (!profile) return null;

  return {
    id: profile.id,
    email: userRes.data.user?.email ?? null,
    fullName: profile.full_name,
    whatsapp: profile.whatsapp,
    bio: profile.bio,
    plan: sub?.plan ?? null,
    status: sub?.status ?? null,
    slug: vitrine?.slug ?? null,
    vitrineActive: vitrine?.is_active ?? null,
    vitrineId: vitrine?.id ?? null,
    vitrineTitle: vitrine?.title ?? null,
    onboardingCompletedAt: profile.onboarding_completed_at,
    deletionRequestedAt: profile.deletion_requested_at,
    createdAt: profile.created_at,
  };
}
