import { NextResponse, type NextRequest } from "next/server";

import { toCsv } from "@/lib/export/to-csv";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * `GET /api/conta/export` (#0021) — direito de acesso/portabilidade (LGPD Art. 18).
 * `?tipo=pessoais|produtos&formato=json|csv`. Autenticado (cookies), lê apenas os
 * dados da própria usuária (RLS owner). Retorna um arquivo para download.
 */
export async function POST() {
  return new NextResponse(null, { status: 405 });
}

const PRODUCT_CSV_COLUMNS = [
  "name",
  "description",
  "price_cents",
  "promo_price_cents",
  "is_available",
  "category",
  "brand",
  "image_urls",
  "created_at",
] as const;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse(null, { status: 401 });

  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo") === "produtos" ? "produtos" : "pessoais";
  const formato = searchParams.get("formato") === "csv" ? "csv" : "json";

  if (tipo === "pessoais") {
    const [{ data: profile }, { data: subscription }, { data: vitrine }, { data: auditLogs }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select(
            "full_name, bio, whatsapp, avatar_url, marketing_opt_in, terms_version, terms_accepted_at, created_at",
          )
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("subscriptions")
          .select("plan, status, current_period_start, current_period_end, canceled_at")
          .eq("owner_id", user.id)
          .maybeSingle(),
        supabase
          .from("vitrines")
          .select("slug, title, subtitle, theme_primary, theme_mode")
          .eq("owner_id", user.id)
          .eq("is_default", true)
          .maybeSingle(),
        supabase
          .from("audit_logs")
          .select("action, entity_type, created_at")
          .eq("actor_id", user.id)
          .order("created_at", { ascending: false })
          .limit(500),
      ]);

    const payload = {
      exported_at: new Date().toISOString(),
      account: { id: user.id, email: user.email },
      profile,
      subscription,
      vitrine,
      activity_log: auditLogs ?? [],
    };

    return jsonFile(payload, "vitrinio-dados-pessoais.json");
  }

  // produtos
  const { data: vitrine } = await supabase
    .from("vitrines")
    .select("id")
    .eq("owner_id", user.id)
    .eq("is_default", true)
    .maybeSingle();

  const { data: products } = vitrine
    ? await supabase
        .from("products")
        .select(
          "name, description, price_cents, promo_price_cents, is_available, created_at, categories(name), brands(name), product_images(url)",
        )
        .eq("vitrine_id", vitrine.id)
        .order("created_at", { ascending: true })
    : { data: [] };

  const rows = (products ?? []).map((p) => ({
    name: p.name,
    description: p.description,
    price_cents: p.price_cents,
    promo_price_cents: p.promo_price_cents,
    is_available: p.is_available,
    category: p.categories?.name ?? "",
    brand: p.brands?.name ?? "",
    image_urls: (p.product_images ?? []).map((img) => img.url).join(" "),
    created_at: p.created_at,
  }));

  if (formato === "csv") {
    return new NextResponse(toCsv(rows, PRODUCT_CSV_COLUMNS), {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": 'attachment; filename="vitrinio-produtos.csv"',
      },
    });
  }

  return jsonFile(
    { exported_at: new Date().toISOString(), products: rows },
    "vitrinio-produtos.json",
  );
}

function jsonFile(payload: unknown, filename: string): NextResponse {
  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}
