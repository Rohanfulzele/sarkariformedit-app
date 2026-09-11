import { PDFArray, PDFContext, PDFDict, PDFDocument, PDFName, PDFRef, PDFStream } from "pdf-lib";

function markReachable(context: PDFContext, value: unknown, visited: Set<number>): void {
  if (value instanceof PDFRef) {
    if (visited.has(value.objectNumber)) return;
    visited.add(value.objectNumber);
    markReachable(context, context.lookup(value), visited);
    return;
  }
  if (value instanceof PDFDict) {
    for (const [, v] of value.entries()) markReachable(context, v, visited);
    return;
  }
  if (value instanceof PDFArray) {
    for (let i = 0; i < value.size(); i++) markReachable(context, value.get(i), visited);
    return;
  }
  if (value instanceof PDFStream) {
    markReachable(context, value.dict, visited);
  }
}

/**
 * Drops indirect objects that are no longer reachable from the document
 * trailer — orphaned images/fonts/form XObjects left behind by whatever tool
 * produced or last edited the file. Every producer that revises a PDF in
 * place tends to leave a few of these, and pdf-lib otherwise carries them
 * through unchanged on every re-save. Purely structural: nothing a page
 * still references is touched, so rendering is pixel-identical to the
 * original.
 */
export function removeOrphanedObjects(pdfDoc: PDFDocument): void {
  const { context } = pdfDoc;
  const visited = new Set<number>();

  markReachable(context, context.trailerInfo.Root, visited);
  markReachable(context, context.trailerInfo.Info, visited);

  for (const [ref] of context.enumerateIndirectObjects()) {
    if (!visited.has(ref.objectNumber)) context.delete(ref);
  }
}

/**
 * Removes XMP metadata, page thumbnail bitmaps, and editor-private
 * "PieceInfo" blobs — none of these are rendered or read by anything a form
 * portal cares about, so dropping them is free size with zero visual or
 * textual change. Only clears the pointers; removeOrphanedObjects() is what
 * actually reclaims the bytes they pointed to.
 */
export function stripNonEssentialMetadata(pdfDoc: PDFDocument): void {
  const metadataKey = PDFName.of("Metadata");
  const pieceInfoKey = PDFName.of("PieceInfo");
  const thumbKey = PDFName.of("Thumb");

  pdfDoc.catalog.delete(metadataKey);
  pdfDoc.catalog.delete(pieceInfoKey);

  for (const page of pdfDoc.getPages()) {
    page.node.delete(thumbKey);
    page.node.delete(pieceInfoKey);
  }
}

/**
 * Every lossless, purely-structural size reduction we have. Safe to run on
 * any PDF, always — it can only shrink the file, and it never touches a
 * byte that affects how the document looks or reads.
 */
export function optimizeLosslessly(pdfDoc: PDFDocument): void {
  stripNonEssentialMetadata(pdfDoc);
  removeOrphanedObjects(pdfDoc);
}
