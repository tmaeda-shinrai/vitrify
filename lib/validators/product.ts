import { z } from "zod";

import { parseBRLToCents } from "@/lib/money";

export const PRODUCT_NAME_MAX = 120;
export const PRODUCT_DESC_MAX = 1000;
/** Guarda de sanidade: R$ 999.999,99. Preço real é validado em centavos (INT). */
export const PRICE_MAX_CENTS = 99_999_999;

const PROMO_MUST_BE_LOWER = "O preço promocional deve ser menor que o preço.";

// Campos compartilhados entre o schema do servidor (centavos) e o do form (reais).
const nameField = z
  .string()
  .trim()
  .min(2, "Informe o nome do produto.")
  .max(PRODUCT_NAME_MAX, `O nome pode ter no máximo ${PRODUCT_NAME_MAX} caracteres.`);

const descriptionField = z
  .string()
  .trim()
  .max(PRODUCT_DESC_MAX, `A descrição pode ter no máximo ${PRODUCT_DESC_MAX} caracteres.`)
  .optional()
  .or(z.literal(""));

const priceCentsField = z
  .number({ invalid_type_error: "Informe um preço válido." })
  .int("Informe um preço válido.")
  .min(0, "O preço não pode ser negativo.")
  .max(PRICE_MAX_CENTS, "Preço muito alto.");

const priceStringField = z
  .string()
  .trim()
  .min(1, "Informe o preço.")
  .refine((v) => parseBRLToCents(v) !== null, "Informe um preço válido.");

const imageUrlField = z.string().url("Adicione uma foto do produto.");

/** Schema autoritativo (servidor): preços já em centavos. */
export const productSchema = z
  .object({
    name: nameField,
    description: descriptionField,
    priceCents: priceCentsField,
    promoPriceCents: priceCentsField.nullable().optional(),
    isAvailable: z.boolean().default(true),
    imageUrl: imageUrlField,
  })
  .superRefine((data, ctx) => {
    if (data.promoPriceCents != null && data.promoPriceCents >= data.priceCents) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["promoPriceCents"],
        message: PROMO_MUST_BE_LOWER,
      });
    }
  });

/** Schema do formulário (cliente): preços como texto em reais (`32,90`). */
export const productFormSchema = z
  .object({
    name: nameField,
    description: descriptionField,
    price: priceStringField,
    promoPrice: z.string().trim().optional().or(z.literal("")),
    isAvailable: z.boolean().default(true),
    imageUrl: imageUrlField,
  })
  .superRefine((data, ctx) => {
    const promoRaw = data.promoPrice?.trim() ?? "";
    if (promoRaw === "") return;

    const promoCents = parseBRLToCents(promoRaw);
    if (promoCents === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["promoPrice"],
        message: "Informe um preço promocional válido.",
      });
      return;
    }

    const priceCents = parseBRLToCents(data.price);
    if (priceCents !== null && promoCents >= priceCents) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["promoPrice"],
        message: PROMO_MUST_BE_LOWER,
      });
    }
  });

export type ProductInput = z.input<typeof productSchema>;
export type ProductFormValues = z.input<typeof productFormSchema>;
