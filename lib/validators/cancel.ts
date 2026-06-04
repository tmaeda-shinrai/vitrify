import { z } from "zod";

/** Pesquisa de saída (opcional, não-bloqueante) ao cancelar — #0019 (`docs/PRICING.md` §6.1). */
export const cancelSchema = z.object({
  reason: z.enum(["price", "usage", "changed_mind", "other"]).optional(),
  comment: z.string().trim().max(300).optional(),
});

export type CancelInput = z.infer<typeof cancelSchema>;
