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
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
          Images to PDF
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Take a photo of each page of a document and turn them into a single PDF, in the order
          you choose. Each image becomes its own A4 page.
        </p>
      </section>

      <ImagesToPdfTool />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Frequently asked questions
        </h2>
        <dl className="flex flex-col gap-4 text-sm">
          <div>
            <dt className="font-medium text-slate-900 dark:text-slate-100">
              What page size does it use?
            </dt>
            <dd className="mt-1 text-slate-600 dark:text-slate-300">
              A4, with a small margin around each image by default. Turn on &ldquo;fit to
              page&rdquo; if you&apos;d rather the image fill the page edge-to-edge.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900 dark:text-slate-100">
              My photo is sideways — can I fix that?
            </dt>
            <dd className="mt-1 text-slate-600 dark:text-slate-300">
              Yes, tap the rotate icon on any image before converting.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-900 dark:text-slate-100">
              The resulting PDF is too big for my portal&apos;s upload limit
            </dt>
            <dd className="mt-1 text-slate-600 dark:text-slate-300">
              Run it through{" "}
              <Link href="/compress-pdf" className="text-brand underline dark:text-blue-400">
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
