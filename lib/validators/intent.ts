import { z } from "zod";

/** Payload do `POST /api/intent` (#0015) — enviado pelo `recordOrderIntent`. */
export const intentSchema = z.object({
  slug: z.string().trim().min(3).max(40),
  productId: z.string().uuid().optional(),
  referrer: z.string().max(500).optional(),
});

export type IntentInput = z.infer<typeof intentSchema>;

/** Payload do `POST /api/view` (#0015 PR2) — contagem de visualização da vitrine. */
export const viewSchema = z.object({
  slug: z.string().trim().min(3).max(40),
});

export type ViewInput = z.infer<typeof viewSchema>;
