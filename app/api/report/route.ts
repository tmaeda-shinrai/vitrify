import { NextResponse, type NextRequest } from "next/server";

import { sendEmail } from "@/lib/email/client";
import { reportFiledEmail } from "@/lib/email/templates";
import { RIGHTS_EMAIL } from "@/lib/legal/links";
import { checkReportRateLimit, getClientIp } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { REPORT_REASON_LABELS, reportSchema } from "@/lib/validators/report";

export const runtime = "nodejs";

/**
 * `POST /api/report` (#0023) — denúncia de vitrine a partir do botão "Denunciar".
 * Anon, rate-limited por IP. Insere em `reports` (service role; a tabela é só admin)
 * e notifica `direitos@` (best-effort). Não vaza se a vitrine existe (resposta neutra).
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const { success } = await checkReportRateLimit(ip);
  if (!success) return new NextResponse(null, { status: 429 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const parsed = reportSchema.safeParse(payload);
  if (!parsed.success) return new NextResponse(null, { status: 400 });

  const { slug, reason, description, reporterEmail } = parsed.data;
  const admin = createAdminClient();

  const { data: vitrine } = await admin
    .from("vitrines")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  // Resposta neutra mesmo se a vitrine não existir (não confirma/nega).
  if (vitrine) {
    await admin.from("reports").insert({
      vitrine_id: vitrine.id,
      reason,
      description: description || null,
      reporter_email: reporterEmail || null,
    });

    try {
      await sendEmail({
        to: RIGHTS_EMAIL,
        ...reportFiledEmail({
          slug,
          reasonLabel: REPORT_REASON_LABELS[reason],
          description: description || null,
          reporterEmail: reporterEmail || null,
        }),
      });
    } catch {
      // best-effort
    }
  }

  return NextResponse.json({ ok: true });
}
