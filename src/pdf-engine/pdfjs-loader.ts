// pdf.js is only needed for rendering/rasterizing pages, which isn't every PDF
// operation (merge and images-to-PDF never touch it), so it's loaded on demand
// rather than bundled into every page that imports this engine.
let pdfjsPromise: ReturnType<typeof loadPdfjs> | null = null;

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
  return pdfjs;
}

export function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = loadPdfjs();
  }
  return pdfjsPromise;
}
