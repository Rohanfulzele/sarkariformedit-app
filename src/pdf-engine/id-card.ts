import { PDFDocument } from "pdf-lib";

const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;
// ID-1 card size (85.60mm x 53.98mm) — the standard for Aadhaar, PAN, driving licences, etc.
const CARD_WIDTH_PT = 242.65;
const CARD_HEIGHT_PT = 153.02;
const GAP_PT = 20;

async function embedImage(pdfDoc: PDFDocument, blob: Blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (blob.type === "image/png") return pdfDoc.embedPng(bytes);
  return pdfDoc.embedJpg(bytes);
}

export async function idCardToPdf(frontImage: Blob, backImage: Blob): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([A4_WIDTH_PT, A4_HEIGHT_PT]);

  const front = await embedImage(pdfDoc, frontImage);
  const back = await embedImage(pdfDoc, backImage);

  const totalHeight = CARD_HEIGHT_PT * 2 + GAP_PT;
  const topMargin = (A4_HEIGHT_PT - totalHeight) / 2;
  const x = (A4_WIDTH_PT - CARD_WIDTH_PT) / 2;

  const frontY = A4_HEIGHT_PT - topMargin - CARD_HEIGHT_PT;
  const backY = frontY - GAP_PT - CARD_HEIGHT_PT;

  page.drawImage(front, { x, y: frontY, width: CARD_WIDTH_PT, height: CARD_HEIGHT_PT });
  page.drawImage(back, { x, y: backY, width: CARD_WIDTH_PT, height: CARD_HEIGHT_PT });

  const bytes = new Uint8Array(await pdfDoc.save());
  return new Blob([bytes], { type: "application/pdf" });
}
