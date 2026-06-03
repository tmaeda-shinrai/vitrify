/**
 * Conversão de cor para o tema. As CSS custom properties do design system guardam
 * cor no formato HSL sem função (ex.: `--primary: 262 83% 58%`), então a cor livre
 * da vitrine (`vitrines.theme_primary`, um hex) precisa virar essa string.
 */

/**
 * Hex (`#RRGGBB` ou `#RGB`, com ou sem `#`) → `"H S% L%"`. Retorna `null` se o
 * valor não for um hex válido.
 */
export function hexToHsl(hex: string): string | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;

  let value = match[1]!;
  if (value.length === 3) {
    value = value
      .split("")
      .map((c) => c + c)
      .join("");
  }

  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;
  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    if (max === r) h = (g - b) / delta + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
