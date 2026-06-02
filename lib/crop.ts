export interface PixelArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.src = url;
  });
}

/**
 * Recorta a área (em pixels) da imagem para um Blob quadrado, via canvas.
 * Usado pelo ImageUploader antes da compressão.
 */
export async function getCroppedBlob(imageSrc: string, area: PixelArea): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas não suportado.");

  canvas.width = area.width;
  canvas.height = area.height;
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao recortar a imagem."))),
      "image/webp",
    );
  });
}
