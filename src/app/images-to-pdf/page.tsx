import type { Metadata } from "next";
import Link from "next/link";
import { ImagesToPdfTool } from "@/components/ImagesToPdfTool";

export const metadata: Metadata = {
  title: "Images to PDF",
  description:
    "Turn phone photos of your documents into a single PDF, one page per image. Reorder and rotate before converting — processed entirely in your browser.",
};

export default function ImagesToPdfPage() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Images to PDF
        </h1>
        <p className="max-w-2xl text-slate-600 dark:text-slate-300">
          Take a photo of each page of a document and turn them into a single PDF, in the order
          you choose. Each image becomes its own A4 page.
        </p>
      </section>

      <ImagesToPdfTool />

      <section className="flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Frequently asked questions
        </h2>
        <dl className="flex flex-col divide-y divide-slate-100 text-sm dark:divide-white/10">
          <div className="flex flex-col gap-1.5 py-4 first:pt-0">
            <dt className="font-medium text-slate-900 dark:text-white">
              What page size does it use?
            </dt>
            <dd className="leading-relaxed text-slate-600 dark:text-slate-300">
              A4, with a small margin around each image by default. Turn on &ldquo;fit to
              page&rdquo; if you&apos;d rather the image fill the page edge-to-edge.
            </dd>
          </div>
          <div className="flex flex-col gap-1.5 py-4">
            <dt className="font-medium text-slate-900 dark:text-white">
              My photo is sideways — can I fix that?
            </dt>
            <dd className="leading-relaxed text-slate-600 dark:text-slate-300">
              Yes, tap the rotate icon on any image before converting.
            </dd>
          </div>
          <div className="flex flex-col gap-1.5 py-4">
            <dt className="font-medium text-slate-900 dark:text-white">
              The resulting PDF is too big for my portal&apos;s upload limit
            </dt>
            <dd className="leading-relaxed text-slate-600 dark:text-slate-300">
              Run it through{" "}
              <Link
                href="/compress-pdf"
                className="font-medium text-brand-600 underline dark:text-brand-300"
              >
                compress PDF
              </Link>{" "}
              afterwards to bring it under a specific size.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
