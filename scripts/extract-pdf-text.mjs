import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import fs from "fs";

const path = process.argv[2];
const outPath = process.argv[3];
const data = new Uint8Array(fs.readFileSync(path));
const doc = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;
console.log("numPages", doc.numPages);
let fullText = "";
for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const content = await page.getTextContent();
  const text = content.items.map((it) => it.str).join(" ");
  fullText += "\n\n--- PAGE " + i + " ---\n" + text;
}
fs.writeFileSync(outPath, fullText);
console.log("wrote", fullText.length, "chars to", outPath);
