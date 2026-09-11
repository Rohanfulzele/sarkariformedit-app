import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CreditCard, FileStack, ImagePlus, Shrink } from "lucide-react";

export const metadata: Metadata = {
  title: "PDF Tools",
  description:
    "Compress, merge, and build PDFs entirely in your browser — no uploads, nothing leaves your device.",
};

const TOOLS = [
  {
    href: "/compress-pdf",
    icon: Shrink,
    title: "Compress PDF",
    description: "Shrink a PDF to a target size — 100KB, 200KB, 500KB, 1MB, or custom.",
  },
  {
    href: "/images-to-pdf",
    icon: ImagePlus,
    title: "Images to PDF",
    description: "Turn photos of your documents into a single PDF, one page per image.",
  },
  {
    href: "/merge-pdf",
    icon: FileStack,
    title: "Merge PDFs",
    description: "Combine 2–20 PDFs into one file, in the order you choose.",
  },
  {
    href: "/id-card-pdf",
    icon: CreditCard,
    title: "ID Card on One Page",
    description: "Place the front and back of an ID card on a single A4 page at real size.",
  },
];

export default function PdfToolsPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          PDF tools
        </h1>
        <p className="max-w-xl text-slate-600 dark:text-slate-300">
          Everything below runs entirely in your browser — your documents are never uploaded to a
          server.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TOOLS.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-brand-400/30"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-400/10 dark:text-brand-300">
                <Icon className="h-5 w-5" />
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-300 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 dark:text-slate-600" />
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">{title}</span>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
