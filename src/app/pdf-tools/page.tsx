import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PDF Tools",
  description:
    "Compress, merge, and build PDFs entirely in your browser — no uploads, nothing leaves your device.",
};

const TOOLS = [
  {
    href: "/compress-pdf",
    title: "Compress PDF",
    description: "Shrink a PDF to a target size — 100KB, 200KB, 500KB, 1MB, or custom.",
  },
  {
    href: "/images-to-pdf",
    title: "Images to PDF",
    description: "Turn photos of your documents into a single PDF, one page per image.",
  },
  {
    href: "/merge-pdf",
    title: "Merge PDFs",
    description: "Combine 2–20 PDFs into one file, in the order you choose.",
  },
  {
    href: "/id-card-pdf",
    title: "ID Card on One Page",
    description: "Place the front and back of an ID card on a single A4 page at real size.",
  },
];

export default function PdfToolsPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
          PDF tools
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Everything below runs entirely in your browser — your documents are never uploaded to a
          server.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="flex flex-col gap-1 rounded-xl border border-slate-200 p-4 transition hover:border-brand hover:shadow-sm dark:border-slate-800"
          >
            <span className="font-medium text-slate-900 dark:text-slate-100">{tool.title}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">{tool.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
