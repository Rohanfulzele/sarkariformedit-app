import type { Metadata } from "next";
import { IdCardTool } from "@/components/IdCardTool";

export const metadata: Metadata = {
  title: "ID Card on One Page",
  description:
    "Place the front and back of an ID card on a single A4 page at real card size, ready to print or upload. Processed entirely in your browser.",
};

export default function IdCardPdfPage() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          ID card on one page
        </h1>
        <p className="max-w-2xl text-slate-600 dark:text-slate-300">
          Many forms ask for a single-page copy of your ID with both sides visible. Upload a photo
          of each side, crop to the card&apos;s edges, and get one A4 PDF with both at true card
          size.
        </p>
      </section>

      <IdCardTool />

      <section className="flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Frequently asked questions
        </h2>
        <dl className="flex flex-col divide-y divide-slate-100 text-sm dark:divide-white/10">
          <div className="flex flex-col gap-1.5 py-4 first:pt-0">
            <dt className="font-medium text-slate-900 dark:text-white">
              Should I black out any numbers first?
            </dt>
            <dd className="leading-relaxed text-slate-600 dark:text-slate-300">
              If the recipient accepts a masked copy, cover digits you don&apos;t need to show
              before uploading — this tool doesn&apos;t redact anything for you.
            </dd>
          </div>
          <div className="flex flex-col gap-1.5 py-4">
            <dt className="font-medium text-slate-900 dark:text-white">
              What size are the cards placed at?
            </dt>
            <dd className="leading-relaxed text-slate-600 dark:text-slate-300">
              The standard ID-1 card size (85.6mm × 53.98mm) — the same size as a credit card,
              Aadhaar, PAN, or driving licence.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
