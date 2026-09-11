import { PDFDocument } from "pdf-lib";
import { rotateImageBlob } from "./rotate-image";
import type { PageImage } from "./types";

const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;
const MARGIN_PT = 28; // ~1cm

async function embedImage(pdfDoc: PDFDocument, blob: Blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (blob.type === "image/png") return pdfDoc.embedPng(bytes);
  return pdfDoc.embedJpg(bytes);
}

export async function imagesToPdf(images: PageImage[], fitToPage: boolean): Promise<Blob> {
  if (images.length === 0) throw new Error("No images to convert");

  const pdfDoc = await PDFDocument.create();
  const availableWidth = A4_WIDTH_PT - MARGIN_PT * 2;
  const availableHeight = A4_HEIGHT_PT - MARGIN_PT * 2;

  for (const { file, rotationDeg } of images) {
    const uprightBlob = await rotateImageBlob(file, rotationDeg);
    const embedded = await embedImage(pdfDoc, uprightBlob);
    const page = pdfDoc.addPage([A4_WIDTH_PT, A4_HEIGHT_PT]);

    const scale = fitToPage
      ? Math.max(availableWidth / embedded.width, availableHeight / embedded.height)
      : Math.min(1, availableWidth / embedded.width, availableHeight / embedded.height);
    const drawWidth = embedded.width * scale;
    const drawHeight = embedded.height * scale;

    page.drawImage(embedded, {
      x: (A4_WIDTH_PT - drawWidth) / 2,
      y: (A4_HEIGHT_PT - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    });
  }

  const bytes = new Uint8Array(await pdfDoc.save());
  return new Blob([bytes], { type: "application/pdf" });
}
