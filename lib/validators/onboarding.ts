import { z } from "zod";

import { isReservedSlug, SLUG_MAX_LENGTH, SLUG_MIN_LENGTH, SLUG_REGEX } from "@/lib/slug";

/** DDDs válidos no Brasil (Anatel). */
const VALID_DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43,
  44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77,
  79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Informe seu nome.")
  .max(80, "Nome muito longo.");

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(SLUG_MIN_LENGTH, `O @ precisa ter ao menos ${SLUG_MIN_LENGTH} caracteres.`)
  .max(SLUG_MAX_LENGTH, `O @ pode ter no máximo ${SLUG_MAX_LENGTH} caracteres.`)
  .regex(SLUG_REGEX, "Use apenas letras minúsculas, números e hífen.")
  .refine((s) => !isReservedSlug(s), "Esse @ é reservado. Escolha outro.");

/**
 * WhatsApp em E.164 sem `+`: 55 + DDD(2) + 9 + 8 dígitos. Aceita entrada com
 * máscara/espaços e normaliza para só dígitos.
 */
export const whatsappSchema = z
  .string()
  .transform((v) => {
    const digits = v.replace(/\D/g, "");
    // Aceita DDD+número (11 dígitos) e prefixa o código do país.
    return digits.length === 11 ? `55${digits}` : digits;
  })
  .refine((v) => /^55\d{2}9\d{8}$/.test(v), "Informe um WhatsApp válido com DDD.")
  .refine((v) => VALID_DDDS.has(Number(v.slice(2, 4))), "DDD inválido.");

export const nameStepSchema = z.object({ fullName: nameSchema });
export const slugStepSchema = z.object({ slug: slugSchema });
export const whatsappStepSchema = z.object({ whatsapp: whatsappSchema });

export type NameStepInput = z.input<typeof nameStepSchema>;
export type SlugStepInput = z.input<typeof slugStepSchema>;
export type WhatsappStepInput = z.input<typeof whatsappStepSchema>;
