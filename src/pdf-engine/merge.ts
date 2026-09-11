import { PDFDocument } from "pdf-lib";

export async function mergePdfs(files: Blob[]): Promise<Blob> {
  if (files.length < 2) throw new Error("Need at least 2 PDFs to merge");

  const mergedDoc = await PDFDocument.create();

  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const sourceDoc = await PDFDocument.load(bytes);
    const pageIndices = sourceDoc.getPageIndices();
    const copiedPages = await mergedDoc.copyPages(sourceDoc, pageIndices);
    for (const page of copiedPages) {
      mergedDoc.addPage(page);
    }
  }

  const bytes = new Uint8Array(await mergedDoc.save());
  return new Blob([bytes], { type: "application/pdf" });
}
