import Link from "next/link";
import { PresetPicker } from "@/components/PresetPicker";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">
          Get your exam photo and signature portal-ready in under a minute
        </h1>
        <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-300">
          Pick your exam below. FormReady resizes and compresses your photo or signature to the
          exact pixel size and file-size range the portal expects — entirely on your device.
          Nothing you upload here ever leaves your phone or computer.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Need to shrink, merge, or build a PDF instead?{" "}
          <Link href="/pdf-tools" className="text-brand underline dark:text-blue-400">
            See PDF tools
          </Link>
          .
        </p>
      </section>

      <PresetPicker />
    </div>
  );
}
