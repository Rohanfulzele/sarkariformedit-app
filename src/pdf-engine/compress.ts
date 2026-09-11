import { PDFDocument, PDFName, PDFRawStream } from "pdf-lib";
import { canvasToBlob } from "./canvas-to-blob";
import { getPageCount, renderPageToCanvas } from "./render-page";
import { optimizeLosslessly } from "./optimize";
import type { CompressPdfOptions, CompressPdfResult } from "./types";

interface QualityStep {
  quality: number;
  scale: number;
}

// Progressively more aggressive image re-encoding, tried against a fresh copy of
// the original each time (never compounding loss from a previous attempt).
const TIER1_STEPS: QualityStep[] = [
  { quality: 0.7, scale: 1 },
  { quality: 0.5, scale: 1 },
  { quality: 0.35, scale: 0.85 },
  { quality: 0.25, scale: 0.65 },
  { quality: 0.15, scale: 0.5 },
];

const RASTER_DPI_STEPS = [150, 120, 96, 72, 50];
// Below this, rasterized text is blurry enough to be unusable. A lower DPI is
// still worth *trying* (it might squeeze under the target and succeed outright),
// but it should never become the "best effort" result we hand back on failure.
const RASTER_QUALITY_FLOOR_DPI = 96;

/**
 * Re-encodes every JPEG-filtered image XObject in place, at lower quality
 * and/or resolution. Text and vector content are untouched — this is the
 * "lossless-friendly" tier the PRD asks for before falling back to
 * rasterizing whole pages. Images that aren't JPEG-encoded (rare in the
 * scanned-document PDFs this tool mostly sees) are left as-is.
 */
async function recompressEmbeddedJpegs(pdfDoc: PDFDocument, quality: number, scale: number): Promise<void> {
  const indirectObjects = pdfDoc.context.enumerateIndirectObjects();

  for (const [ref, obj] of indirectObjects) {
    if (!(obj instanceof PDFRawStream)) continue;

    const subtype = obj.dict.lookup(PDFName.of("Subtype"));
    if (!subtype || subtype.toString() !== "/Image") continue;

    const filter = obj.dict.lookup(PDFName.of("Filter"));
    if (!filter || filter.toString() !== "/DCTDecode") continue;

    try {
      const blob = new Blob([new Uint8Array(obj.getContents())], { type: "image/jpeg" });
      const bitmap = await createImageBitmap(blob);
      const newWidth = Math.max(1, Math.round(bitmap.width * scale));
      const newHeight = Math.max(1, Math.round(bitmap.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);

      const newBlob = await canvasToBlob(canvas, "image/jpeg", quality);
      const newBytes = new Uint8Array(await newBlob.arrayBuffer());
      if (newBytes.length >= obj.getContentsSize()) continue;

      const newDict = obj.dict.clone(pdfDoc.context);
      newDict.set(PDFName.of("Width"), pdfDoc.context.obj(newWidth));
      newDict.set(PDFName.of("Height"), pdfDoc.context.obj(newHeight));
      pdfDoc.context.assign(ref, PDFRawStream.of(newDict, newBytes));
    } catch {
      // Can't decode this image (e.g. CMYK JPEG) — leave it untouched.
    }
  }
}

/** True if the PDF has at least one JPEG-encoded image XObject Tier 1 could shrink. */
function hasRecompressibleJpegs(pdfDoc: PDFDocument): boolean {
  for (const [, obj] of pdfDoc.context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    const subtype = obj.dict.lookup(PDFName.of("Subtype"));
    if (!subtype || subtype.toString() !== "/Image") continue;
    const filter = obj.dict.lookup(PDFName.of("Filter"));
    if (filter && filter.toString() === "/DCTDecode") return true;
  }
  return false;
}

/** Renders every page to an image and rebuilds the PDF from those — text stops being selectable. */
async function rasterizePdf(originalBytes: Uint8Array, dpi: number): Promise<Uint8Array<ArrayBuffer>> {
  const pageCount = await getPageCount(originalBytes);
  const outDoc = await PDFDocument.create();

  for (let i = 1; i <= pageCount; i++) {
    const { canvas, widthPt, heightPt } = await renderPageToCanvas(originalBytes, i, dpi);
    const blob = await canvasToBlob(canvas, "image/jpeg", 0.75);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const image = await outDoc.embedJpg(bytes);
    const page = outDoc.addPage([widthPt, heightPt]);
    page.drawImage(image, { x: 0, y: 0, width: widthPt, height: heightPt });
  }

  return new Uint8Array(await outDoc.save());
}

export async function compressPdf(file: Blob, options: CompressPdfOptions): Promise<CompressPdfResult> {
  const { targetKB, onProgress } = options;
  const targetBytes = targetKB * 1024;
  const originalBytes = new Uint8Array(await file.arrayBuffer());

  if (originalBytes.length <= targetBytes) {
    return {
      blob: file,
      originalBytes: originalBytes.length,
      finalBytes: originalBytes.length,
      rasterized: false,
      reachedTarget: true,
    };
  }

  onProgress?.("Removing unused data…");
  const optimizedDoc = await PDFDocument.load(originalBytes);
  optimizeLosslessly(optimizedDoc);
  const losslessBytes = new Uint8Array(await optimizedDoc.save());

  let bestBytes = losslessBytes;
  let bestRasterized = false;
  let bestDpi: number | undefined;

  if (losslessBytes.length <= targetBytes) {
    return {
      blob: new Blob([losslessBytes], { type: "application/pdf" }),
      originalBytes: originalBytes.length,
      finalBytes: losslessBytes.length,
      rasterized: false,
      reachedTarget: true,
    };
  }

  if (hasRecompressibleJpegs(optimizedDoc)) {
    for (const step of TIER1_STEPS) {
      onProgress?.(`Recompressing images at ${Math.round(step.quality * 100)}% quality…`);
      const doc = await PDFDocument.load(losslessBytes);
      await recompressEmbeddedJpegs(doc, step.quality, step.scale);
      const bytes = new Uint8Array(await doc.save());

      if (bytes.length < bestBytes.length) {
        bestBytes = bytes;
        bestRasterized = false;
      }
      if (bytes.length <= targetBytes) {
        return {
          blob: new Blob([bytes], { type: "application/pdf" }),
          originalBytes: originalBytes.length,
          finalBytes: bytes.length,
          rasterized: false,
          reachedTarget: true,
        };
      }
    }
  }

  for (const dpi of RASTER_DPI_STEPS) {
    onProgress?.(`Rendering pages at ${dpi} DPI…`);
    const bytes = await rasterizePdf(originalBytes, dpi);

    if (bytes.length <= targetBytes) {
      return {
        blob: new Blob([bytes], { type: "application/pdf" }),
        originalBytes: originalBytes.length,
        finalBytes: bytes.length,
        rasterized: true,
        reachedTarget: true,
        dpiUsed: dpi,
      };
    }
    // Only let this become the "best effort" fallback if it's still legible —
    // otherwise we'd rather hand back a larger-but-readable file than the
    // smallest-but-illegible one (see RASTER_QUALITY_FLOOR_DPI).
    if (dpi >= RASTER_QUALITY_FLOOR_DPI && bytes.length < bestBytes.length) {
      bestBytes = bytes;
      bestRasterized = true;
      bestDpi = dpi;
    }
  }

  return {
    blob: new Blob([bestBytes], { type: "application/pdf" }),
    originalBytes: originalBytes.length,
    finalBytes: bestBytes.length,
    rasterized: bestRasterized,
    reachedTarget: false,
    dpiUsed: bestDpi,
  };
}
