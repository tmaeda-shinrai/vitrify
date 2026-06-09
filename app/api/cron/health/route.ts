import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { checkHealth, summarizeHealth } from "@/lib/admin/health";
import { notifyAdmins } from "@/lib/alerts";
import { adminAlertEmail } from "@/lib/email/templates";
import { serverEnv } from "@/lib/env";

export const runtime = "nodejs";

/** Comparação em tempo constante do segredo do cron. */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * `POST /api/cron/health` (#0024, ARCHITECTURE §8.4) — agendado por pg_cron com o
 * header `x-cron-secret`. Roda o health check (DB/Storage com ping real) e, se algum
 * serviço estiver "down", envia um alerta por e-mail aos admins. Best-effort.
 */
export async function POST(request: NextRequest) {
  const secret = serverEnv.CRON_SECRET;
  const token = request.headers.get("x-cron-secret") ?? "";
  if (!secret || !safeEqual(token, secret)) {
    return new NextResponse(null, { status: 401 });
  }

  const services = await checkHealth();
  const down = services.filter((s) => s.status === "down");

  if (down.length > 0) {
    await notifyAdmins(
      adminAlertEmail({
        title: "Serviço indisponível",
        message: "O health check detectou serviço(s) fora do ar. Verifique o painel /admin/health.",
        details: Object.fromEntries(down.map((s) => [s.name, s.detail])),
      }),
    );
  }

  return NextResponse.json({
    ok: true,
    status: summarizeHealth(services),
    down: down.map((s) => s.name),
  });
}
