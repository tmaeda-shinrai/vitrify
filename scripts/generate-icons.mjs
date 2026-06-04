// Gera o conjunto de ícones do PWA (#0017) a partir de um logo-fonte.
//
// Uso:
//   node scripts/generate-icons.mjs [caminho-do-logo]
//
// Procura o logo em (nesta ordem): argumento da CLI, assets/icon-source.svg,
// assets/icon-source.png, public/icon.svg, public/icon.png. Aceita SVG ou PNG.
// Saída em public/icons/: icon-192, icon-512 (transparentes, purpose "any"),
// icon-maskable-512 (logo a 80% sobre fundo da marca, safe zone) e
// apple-touch-icon (180, fundo da marca — iOS não lida bem com transparência).
//
// Os PNGs gerados são commitados; rode este script novamente quando o logo mudar.

import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

// brand-primary (#7C3AED) — mesmo token do theme_color do manifest.
const BRAND_BG = { r: 124, g: 58, b: 237, alpha: 1 };
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };
const OUT_DIR = "public/icons";

const sourceCandidates = [
  process.argv[2],
  "assets/icon-source.svg",
  "assets/icon-source.png",
  "public/icon.svg",
  "public/icon.png",
].filter(Boolean);

const source = sourceCandidates.find((candidate) => existsSync(candidate));
if (!source) {
  console.error(
    "Logo-fonte não encontrado. Coloque um SVG/PNG (≥512px) em assets/icon-source.svg " +
      "ou passe o caminho como argumento: node scripts/generate-icons.mjs caminho/logo.svg",
  );
  process.exit(1);
}

// density alto para rasterizar SVGs com nitidez; ignorado para fontes PNG.
const load = () => sharp(source, { density: 384 });

await mkdir(OUT_DIR, { recursive: true });

// Ícones "any": logo cheio sobre fundo transparente.
for (const size of [192, 512]) {
  await load()
    .resize(size, size, { fit: "contain", background: TRANSPARENT })
    .png()
    .toFile(path.join(OUT_DIR, `icon-${size}.png`));
}

// Apple touch icon: 180px, fundo da marca achatado (sem alpha).
await load()
  .resize(180, 180, { fit: "contain", background: BRAND_BG })
  .flatten({ background: BRAND_BG })
  .png()
  .toFile(path.join(OUT_DIR, "apple-touch-icon.png"));

// Maskable 512: logo a 80% (safe zone) centralizado sobre fundo da marca.
const maskableSize = 512;
const inner = Math.round(maskableSize * 0.8);
const logo = await load()
  .resize(inner, inner, { fit: "contain", background: TRANSPARENT })
  .png()
  .toBuffer();

await sharp({
  create: { width: maskableSize, height: maskableSize, channels: 4, background: BRAND_BG },
})
  .composite([{ input: logo, gravity: "center" }])
  .png()
  .toFile(path.join(OUT_DIR, "icon-maskable-512.png"));

console.log(`Ícones gerados em ${OUT_DIR}/ a partir de ${source}`);
