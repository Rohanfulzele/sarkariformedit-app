import Link from "next/link";
import { ArrowRight, FileText, ShieldCheck, Zap } from "lucide-react";
import { PresetPicker } from "@/components/PresetPicker";

const TRUST_POINTS = [
  { icon: ShieldCheck, label: "100% private", detail: "Nothing ever leaves your device" },
  { icon: Zap, label: "Under a minute", detail: "Pick your exam, crop, done" },
  { icon: FileText, label: "Official specs", detail: "Sourced from real notifications" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16">
      <section className="relative overflow-hidden rounded-3xl bg-hero-mesh px-6 py-14 text-center sm:px-10 sm:py-20">
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:border-brand-400/30 dark:bg-brand-400/10 dark:text-brand-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Runs entirely in your browser
          </span>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Get your exam photo &amp; signature <span className="text-brand-600 dark:text-brand-300">portal-ready</span> in under a minute
          </h1>

          <p className="max-w-xl text-balance text-base text-slate-600 dark:text-slate-300 sm:text-lg">
            Pick your exam below. SarkariFormEdit resizes and compresses your photo or signature to
            the exact pixel size and file-size range the portal expects — nothing you upload here
            ever leaves your phone or computer.
          </p>

          <Link
            href="/pdf-tools"
            className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-soft transition-all hover:border-brand-200 hover:text-brand-700 hover:shadow-card dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-brand-400/30 dark:hover:text-brand-300"
          >
            Need to shrink, merge, or build a PDF instead?
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TRUST_POINTS.map(({ icon: Icon, label, detail }) => (
          <div
            key={label}
            className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-400/10 dark:text-brand-300">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{detail}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Find your exam</h2>
        <PresetPicker />
      </section>
    </div>
  );
}
