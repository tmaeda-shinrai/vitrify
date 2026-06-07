import { z } from "zod";

/** Comprimento mínimo de senha (alinhado a supabase/config.toml). */
export const PASSWORD_MIN_LENGTH = 8;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Informe seu e-mail.")
  .email("E-mail inválido.");

const password = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `A senha precisa ter ao menos ${PASSWORD_MIN_LENGTH} caracteres.`);

const fullName = z
  .string()
  .min(2, "Informe seu nome.")
  .max(80, "Nome muito longo.")
  .transform((v) => v.trim());

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Informe sua senha."),
});

export const signUpSchema = z
  .object({
    fullName,
    email,
    password,
    confirmPassword: z.string(),
    // Aceite obrigatório dos Termos e da Política de Privacidade (#0021).
    termsAccepted: z.literal(true, {
      errorMap: () => ({ message: "É necessário aceitar os termos para criar a conta." }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });

export const resetRequestSchema = z.object({ email });

export const newPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ResetRequestInput = z.infer<typeof resetRequestSchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
