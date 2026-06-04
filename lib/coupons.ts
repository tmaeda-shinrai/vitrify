import type { Database } from "@/types/supabase";

/**
 * Cálculo puro do efeito de um cupom (#0019) — aplicado **só na 1ª cobrança** no
 * checkout. `percent`/`fixed_cents` mudam o valor; `free_days` adia o vencimento.
 */

export type CouponDiscountType = Database["public"]["Enums"]["coupon_discount_type"];

export interface CouponDiscount {
  /** Novo valor da 1ª cobrança em centavos; `null` para `free_days`. */
  firstChargeCents: number | null;
  /** Dias para adiar o vencimento da 1ª cobrança; `null` caso contrário. */
  freeDays: number | null;
}

export function applyDiscount(
  baseCents: number,
  type: CouponDiscountType,
  value: number,
): CouponDiscount {
  switch (type) {
    case "percent":
      return {
        firstChargeCents: Math.max(0, Math.round((baseCents * (100 - value)) / 100)),
        freeDays: null,
      };
    case "fixed_cents":
      return { firstChargeCents: Math.max(0, baseCents - value), freeDays: null };
    case "free_days":
      return { firstChargeCents: null, freeDays: value };
  }
}
