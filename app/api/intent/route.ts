import { NextResponse, type NextRequest } from "next/server";

import { clientEnv } from "@/lib/env";
import { hashIp, shortUserAgent, sourceFromReferrer } from "@/lib/intent-source";
import { checkIntentRateLimit, getClientIp, markIntentOnce } from "@/lib/rate-limit";
import { createPublicClient } from "@/lib/supabase/public";
import { intentSchema } from "@/lib/validators/intent";

/**
 * `POST /api/intent` (#0015) — registra a intenção de pedido disparada pelo botão
 * "Pedir no WhatsApp" (#0013), sem que o cliente espere a resposta. LGPD: guarda só
 * o SHA-256 do IP e o user-agent resumido. Roda no runtime Node (`node:crypto`).
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);

  const { success } = await checkIntentRateLimit(ip);
  if (!success) return new NextResponse(null, { status: 429 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const parsed = intentSchema.safeParse(payload);
  if (!parsed.success) return new NextResponse(null, { status: 400 });

  const { slug, productId, referrer } = parsed.data;

  try {
    const ipHash = hashIp(ip);

    // Dedup curto por IP+produto para não inflar em recliques rápidos.
    if (!(await markIntentOnce(`${ipHash}:${productId ?? "geral"}`))) {
      return new NextResponse(null, { status: 204 });
    }

    const supabase = createPublicClient();
    const { data: vitrine } = await supabase
      .from("vitrines")
      .select("id")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (!vitrine) return new NextResponse(null, { status: 204 });

    await supabase.from("order_intents").insert({
      vitrine_id: vitrine.id,
      product_id: productId ?? null,
      source: sourceFromReferrer(referrer, clientEnv.NEXT_PUBLIC_APP_URL),
      user_agent_short: shortUserAgent(request.headers.get("user-agent")),
      ip_hash: ipHash,
    });
  } catch {
    // Não-bloqueante: nunca propaga erro ao cliente.
  }

  return new NextResponse(null, { status: 204 });
}
