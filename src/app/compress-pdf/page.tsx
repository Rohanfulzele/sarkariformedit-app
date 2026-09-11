import type { Metadata } from "next";
import { CompressPdfPicker } from "@/components/CompressPdfPicker";

export const metadata: Metadata = {
  title: "Compress PDF to a Custom Size",
  description:
    "Shrink a PDF to a specific file size — pick 100KB, 200KB, 500KB, 1MB, or enter your own target. Processed entirely in your browser.",
};

export default function CompressPdfPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Compress PDF to a custom size
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Pick a target size below, or enter your own. SarkariFormEdit first tries re-encoding the
          embedded images at lower quality — this keeps any text in the PDF selectable. If that
          isn&apos;t enough, it falls back to converting pages to images, with a clear warning
          before you download.
        </p>
      </section>

      <CompressPdfPicker />
    </div>
  );
}
