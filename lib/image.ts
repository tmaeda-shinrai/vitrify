/** Tipos de imagem aceitos no upload. SVG é bloqueado (vetor de XSS). */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

/** Saída da compressão é sempre webp. */
export const OUTPUT_IMAGE_TYPE = "image/webp";
export const OUTPUT_IMAGE_EXTENSION = "webp";

export function isAllowedImageType(type: string): type is AllowedImageType {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type);
}

/** Limites de compressão no cliente (DESIGN §4.5 / ARCHITECTURE §5.1). */
export const IMAGE_COMPRESSION = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1200,
} as const;

/**
 * Resposta de uma signed URL de upload, emitida por uma Server Action e consumida
 * pelo `ImageUploader` no cliente. Compartilhada por avatars (#0009) e produtos.
 */
export interface SignedUpload {
  ok: boolean;
  error?: string;
  path?: string;
  token?: string;
  publicUrl?: string;
}
