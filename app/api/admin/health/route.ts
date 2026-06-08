import { NextResponse } from "next/server";

import { checkHealth, summarizeHealth } from "@/lib/admin/health";
import { getAdminUser } from "@/lib/admin/guard";

export const runtime = "nodejs";

/** `GET /api/admin/health` (#0023) — status JSON dos serviços. Restrito a ADMIN_EMAILS. */
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return new NextResponse(null, { status: 404 });

  const services = await checkHealth();
  return NextResponse.json({ status: summarizeHealth(services), services });
}
