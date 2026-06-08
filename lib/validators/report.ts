import { z } from "zod";

/** Motivos de denúncia (#0023) — alinhados ao conteúdo proibido de LEGAL.md §4.2. */
export const REPORT_REASONS = ["copyright", "prohibited", "spam", "other"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  copyright: "Direitos autorais ou de imagem",
  prohibited: "Conteúdo proibido (ilegal, falsificado, etc.)",
  spam: "Spam ou fraude",
  other: "Outro",
};

/** Payload do `POST /api/report`. */
export const reportSchema = z.object({
  slug: z.string().trim().min(3).max(40),
  reason: z.enum(REPORT_REASONS),
  description: z.string().trim().max(1000).optional(),
  reporterEmail: z.string().trim().email().max(255).optional().or(z.literal("")),
});

export type ReportInput = z.infer<typeof reportSchema>;
