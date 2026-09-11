import { getPdfjs } from "./pdfjs-loader";
import type { PdfPreview } from "./types";

const POINTS_PER_INCH = 72;

/** Renders one page to a canvas. `dpi` controls output resolution. */
export async function renderPageToCanvas(
  pdfBytes: Uint8Array,
  pageNumber: number,
  dpi: number
): Promise<{ canvas: HTMLCanvasElement; widthPt: number; heightPt: number }> {
  const pdfjs = await getPdfjs();
  // pdf.js transfers (detaches) the buffer it's given to its worker, so a fresh
  // copy is required on every call — otherwise a second call with the same
  // source bytes throws "An ArrayBuffer is detached and could not be cloned."
  const loadingTask = pdfjs.getDocument({ data: pdfBytes.slice() });
  const doc = await loadingTask.promise;
  const page = await doc.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = dpi / POINTS_PER_INCH;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");

  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  await loadingTask.destroy();

  return { canvas, widthPt: baseViewport.width, heightPt: baseViewport.height };
}

export async function getPageCount(pdfBytes: Uint8Array): Promise<number> {
  const pdfjs = await getPdfjs();
  const loadingTask = pdfjs.getDocument({ data: pdfBytes.slice() });
  const doc = await loadingTask.promise;
  const count = doc.numPages;
  await loadingTask.destroy();
  return count;
}

export async function renderFirstPagePreview(pdfBytes: Uint8Array): Promise<PdfPreview> {
  const { canvas, widthPt, heightPt } = await renderPageToCanvas(pdfBytes, 1, 96);
  return { dataUrl: canvas.toDataURL("image/jpeg", 0.85), widthPt, heightPt };
}
