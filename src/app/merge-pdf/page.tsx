import type { Metadata } from "next";
import { MergePdfTool } from "@/components/MergePdfTool";

export const metadata: Metadata = {
  title: "Merge PDFs",
  description:
    "Combine 2 to 20 PDF files into one, in the order you choose. Processed entirely in your browser — files are never uploaded.",
};

export default function MergePdfPage() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Merge PDFs
        </h1>
        <p className="max-w-2xl text-slate-600 dark:text-slate-300">
          Combine multiple PDFs — like a form and its supporting documents — into a single file.
          Reorder them however you like before merging. Handles PDFs with different page sizes
          without distorting them.
        </p>
      </section>

      <MergePdfTool />

      <section className="flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Frequently asked questions
        </h2>
        <dl className="flex flex-col divide-y divide-slate-100 text-sm dark:divide-white/10">
          <div className="flex flex-col gap-1.5 py-4 first:pt-0">
            <dt className="font-medium text-slate-900 dark:text-white">
              How many PDFs can I merge?
            </dt>
            <dd className="leading-relaxed text-slate-600 dark:text-slate-300">
              Up to 20 files in one go. Use the arrows (or drag) to put them in the order you want
              before merging.
            </dd>
          </div>
          <div className="flex flex-col gap-1.5 py-4">
            <dt className="font-medium text-slate-900 dark:text-white">
              Will it work if my PDFs are different sizes (A4, letter, etc.)?
            </dt>
            <dd className="leading-relaxed text-slate-600 dark:text-slate-300">
              Yes — each page keeps its own original size in the merged file, nothing gets
              stretched or cropped.
            </dd>
          </div>
          <div className="flex flex-col gap-1.5 py-4">
            <dt className="font-medium text-slate-900 dark:text-white">
              Does this work on password-protected PDFs?
            </dt>
            <dd className="leading-relaxed text-slate-600 dark:text-slate-300">
              Not yet — remove the password first using your PDF reader, then merge.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
