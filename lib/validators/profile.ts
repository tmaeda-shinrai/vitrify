import { z } from "zod";

import { nameSchema, slugSchema, whatsappSchema } from "@/lib/validators/onboarding";

export const BIO_MAX_LENGTH = 160;
const SUBTITLE_MAX_LENGTH = 120;
const TITLE_MAX_LENGTH = 80;

const bio = z
  .string()
  .trim()
  .max(BIO_MAX_LENGTH, `A bio pode ter no máximo ${BIO_MAX_LENGTH} caracteres.`)
  .optional()
  .or(z.literal(""));

export const profileSchema = z.object({
  fullName: nameSchema,
  bio,
  whatsapp: whatsappSchema,
  avatarUrl: z.string().url().nullable().optional(),
});

export const vitrineSchema = z.object({
  slug: slugSchema,
  title: z
    .string()
    .trim()
    .min(2, "Informe um título.")
    .max(TITLE_MAX_LENGTH, `O título pode ter no máximo ${TITLE_MAX_LENGTH} caracteres.`),
  subtitle: z
    .string()
    .trim()
    .max(SUBTITLE_MAX_LENGTH, `O subtítulo pode ter no máximo ${SUBTITLE_MAX_LENGTH} caracteres.`)
    .optional()
    .or(z.literal("")),
});

export type ProfileInput = z.input<typeof profileSchema>;
export type VitrineInput = z.input<typeof vitrineSchema>;
