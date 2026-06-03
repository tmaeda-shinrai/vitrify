import { NextResponse, type NextRequest } from "next/server";

import { hashIp } from "@/lib/intent-source";
import { checkViewRateLimit, getClientIp, markViewOnce } from "@/lib/rate-limit";
import { createPublicClient } from "@/lib/supabase/public";
import { viewSchema } from "@/lib/validators/intent";

/**
 * `POST /api/view` (#0015 PR2) — conta uma visualização da vitrine. Roda no client
 * porque a página é estática/ISR. Dedup curto por IP+slug evita inflar entre abas;
 * o reload é deduplicado por sessão no client. Não-bloqueante (sempre 204).
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);

  const { success } = await checkViewRateLimit(ip);
  if (!success) return new NextResponse(null, { status: 429 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const parsed = viewSchema.safeParse(payload);
  if (!parsed.success) return new NextResponse(null, { status: 400 });

  const { slug } = parsed.data;

  try {
    if (!(await markViewOnce(`${hashIp(ip)}:${slug}`))) {
      return new NextResponse(null, { status: 204 });
    }
    await createPublicClient().rpc("increment_vitrine_views", { p_slug: slug });
  } catch {
    // não-bloqueante: nunca propaga erro ao cliente.
  }

  return new NextResponse(null, { status: 204 });
}
