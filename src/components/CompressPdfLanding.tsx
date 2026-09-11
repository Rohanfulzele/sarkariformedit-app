import { CompressPdfTool } from "./CompressPdfTool";

interface CompressPdfLandingProps {
  targetKB: number;
  label: string;
}

export function CompressPdfLanding({ targetKB, label }: CompressPdfLandingProps) {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Compress PDF to <span className="text-brand-600 dark:text-brand-300">{label}</span>
        </h1>
        <p className="max-w-2xl text-slate-600 dark:text-slate-300">
          Many portals cap PDF uploads at a specific size. This tool first re-encodes the images
          inside your PDF at lower quality — keeping any text selectable — and only falls back to
          converting pages to images if that isn&apos;t enough to reach {label}, with a clear
          warning before you download.
        </p>
      </section>

      <CompressPdfTool targetKB={targetKB} />

      <section className="flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Frequently asked questions
        </h2>
        <dl className="flex flex-col divide-y divide-slate-100 text-sm dark:divide-white/10">
          <div className="flex flex-col gap-1.5 py-4 first:pt-0">
            <dt className="font-medium text-slate-900 dark:text-white">
              Will this make my PDF&apos;s text unreadable?
            </dt>
            <dd className="leading-relaxed text-slate-600 dark:text-slate-300">
              Not for most PDFs — the first pass only re-compresses embedded images and leaves
              text as real, selectable text. Pages only get converted to images as a last resort,
              and you&apos;ll see an explicit warning if that happens.
            </dd>
          </div>
          <div className="flex flex-col gap-1.5 py-4">
            <dt className="font-medium text-slate-900 dark:text-white">
              Why is my PDF still large after compressing?
            </dt>
            <dd className="leading-relaxed text-slate-600 dark:text-slate-300">
              PDFs that are mostly text and vector graphics (not scanned images) are usually
              already small — there isn&apos;t much left to compress without rasterizing, which
              trades away selectable text for size.
            </dd>
          </div>
          <div className="flex flex-col gap-1.5 py-4">
            <dt className="font-medium text-slate-900 dark:text-white">
              Does this work on password-protected PDFs?
            </dt>
            <dd className="leading-relaxed text-slate-600 dark:text-slate-300">
              Not yet — remove the password first using your PDF reader, then compress.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
