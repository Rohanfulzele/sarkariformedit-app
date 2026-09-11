/** Physically rotates image pixels so downstream code never has to reason about orientation. */
export async function rotateImageBlob(blob: Blob, rotationDeg: 0 | 90 | 180 | 270): Promise<Blob> {
  if (rotationDeg === 0) return blob;

  const bitmap = await createImageBitmap(blob);
  const swapped = rotationDeg === 90 || rotationDeg === 270;
  const canvas = new OffscreenCanvas(
    swapped ? bitmap.height : bitmap.width,
    swapped ? bitmap.width : bitmap.height
  );
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotationDeg * Math.PI) / 180);
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);

  const isPng = blob.type === "image/png";
  return canvas.convertToBlob(isPng ? { type: "image/png" } : { type: "image/jpeg", quality: 0.92 });
}
