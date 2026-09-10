import type { CropRect } from "./types";

export async function decodeImage(buffer: ArrayBuffer): Promise<ImageBitmap> {
  const blob = new Blob([buffer]);
  return createImageBitmap(blob, { imageOrientation: "from-image" });
}

export function cropAndScale(
  source: ImageBitmap,
  crop: CropRect,
  targetWidth: number,
  targetHeight: number,
  reserveBottomStripPx = 0
): OffscreenCanvas {
  const canvas = new OffscreenCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  const photoAreaHeight = targetHeight - reserveBottomStripPx;
  ctx.drawImage(
    source,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    targetWidth,
    photoAreaHeight
  );

  return canvas;
}

/**
 * Thresholds a signature crop to a pure white background while preserving ink
 * colour, then tightens the crop to the ink's bounding box (plus padding).
 * Good enough for a phone photo of a signature on white paper; no ML needed.
 */
export function cleanupSignatureBackground(
  canvas: OffscreenCanvas,
  threshold = 200
): { croppedCanvas: OffscreenCanvas } {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx] ?? 0;
      const g = data[idx + 1] ?? 0;
      const b = data[idx + 2] ?? 0;
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

      if (luminance >= threshold) {
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
      } else {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  if (maxX < minX || maxY < minY) {
    return { croppedCanvas: canvas };
  }

  const padding = Math.round(Math.min(width, height) * 0.08);
  const boxX = Math.max(0, minX - padding);
  const boxY = Math.max(0, minY - padding);
  const boxW = Math.min(width, maxX + padding) - boxX;
  const boxH = Math.min(height, maxY + padding) - boxY;

  const cropped = new OffscreenCanvas(boxW, boxH);
  const croppedCtx = cropped.getContext("2d");
  if (!croppedCtx) throw new Error("2D canvas context unavailable");

  croppedCtx.fillStyle = "#ffffff";
  croppedCtx.fillRect(0, 0, boxW, boxH);
  croppedCtx.drawImage(canvas, boxX, boxY, boxW, boxH, 0, 0, boxW, boxH);

  return { croppedCanvas: cropped };
}

export function drawNameDateStrip(
  canvas: OffscreenCanvas,
  text: string,
  stripHeightPx: number
): void {
  if (stripHeightPx <= 0) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");

  const y = canvas.height - stripHeightPx;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, y, canvas.width, stripHeightPx);
  ctx.fillStyle = "#000000";
  const fontSize = Math.max(10, Math.round(stripHeightPx * 0.55));
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, y + stripHeightPx / 2, canvas.width - 8);
}
