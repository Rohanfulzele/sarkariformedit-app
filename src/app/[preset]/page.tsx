import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FileType, HardDrive, Palette, Ruler } from "lucide-react";
import { getAllPresets, getPresetById } from "@presets";
import { ToolFlowLazy } from "@/components/ToolFlowLazy";
import { PresetMeta } from "@/components/PresetMeta";
import { PortalFeedbackPrompt } from "@/components/PortalFeedbackPrompt";
import { presetToToolSpec } from "@/lib/tool-spec";
import { buildPresetFaq } from "@/lib/preset-faq";

interface PageProps {
  params: Promise<{ preset: string }>;
}

export function generateStaticParams() {
  return getAllPresets().map((preset) => ({ preset: preset.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { preset: presetId } = await params;
  const preset = getPresetById(presetId);
  if (!preset) return {};

  const docLabel = preset.documentType === "thumb_impression" ? "Thumb Impression" : preset.documentType;
  const title = `${preset.examName} ${docLabel} Resizer — ${preset.dimensions.widthPx}×${preset.dimensions.heightPx}px, ${preset.fileSizeKB.min}-${preset.fileSizeKB.max}KB`;
  const description = `Free tool to resize your ${preset.examName} ${docLabel.toLowerCase()} to exactly ${preset.dimensions.widthPx}×${preset.dimensions.heightPx}px and ${preset.fileSizeKB.min}-${preset.fileSizeKB.max}KB. Processed entirely in your browser.`;

  return { title, description };
}

export default async function PresetPage({ params }: PageProps) {
  const { preset: presetId } = await params;
  const preset = getPresetById(presetId);
  if (!preset) notFound();

  const docLabel = preset.documentType === "thumb_impression" ? "Thumb Impression" : preset.documentType;
  const spec = presetToToolSpec(preset);
  const faq = buildPresetFaq(preset);
  const siblings = getAllPresets().filter(
    (p) => p.examName === preset.examName && p.id !== preset.id
  );

  const specCards = [
    {
      icon: Ruler,
      label: "Dimensions",
      value: `${preset.dimensions.widthPx} × ${preset.dimensions.heightPx} px`,
      hint: preset.dimensions.physical
        ? `${preset.dimensions.physical.widthCm}cm × ${preset.dimensions.physical.heightCm}cm @ ${preset.dimensions.physical.dpi} DPI`
        : undefined,
    },
    {
      icon: HardDrive,
      label: "File size",
      value: `${preset.fileSizeKB.min}–${preset.fileSizeKB.max} KB`,
    },
    {
      icon: FileType,
      label: "Format",
      value: preset.formats.map((f) => f.toUpperCase()).join(" or "),
    },
    {
      icon: Palette,
      label: "Background",
      value: preset.background.description ?? preset.background.requirement,
    },
  ];

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {preset.examName} <span className="text-brand-600 dark:text-brand-300">{docLabel}</span>{" "}
          Resizer
        </h1>
        <p className="max-w-2xl text-slate-600 dark:text-slate-300">
          Resize your {docLabel.toLowerCase()} to exactly {preset.dimensions.widthPx}×
          {preset.dimensions.heightPx}px and {preset.fileSizeKB.min}–{preset.fileSizeKB.max} KB —
          the format required for {preset.examName}. Not affiliated with the exam conducting body;
          confirm against your official notification.
        </p>
      </section>

      <PortalFeedbackPrompt
        presetId={preset.id}
        examName={preset.examName}
        documentType={docLabel.toLowerCase()}
      />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {specCards.map(({ icon: Icon, label, value, hint }) => (
          <div
            key={label}
            className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <Icon className="h-4 w-4 text-brand-500 dark:text-brand-300" />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {label}
              </p>
              <p className="text-sm font-semibold leading-snug text-slate-900 dark:text-white">
                {value}
              </p>
              {hint && <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
            </div>
          </div>
        ))}
      </section>

      <PresetMeta preset={preset} />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">How it works</h2>
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            "Take a photo or choose one from your gallery.",
            "Crop it to fit the required frame.",
            "Download the file — it's already the right size and format.",
          ].map((text, i) => (
            <li
              key={text}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-4 dark:border-white/10"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600 dark:bg-brand-400/10 dark:text-brand-300">
                {i + 1}
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-300">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <ToolFlowLazy spec={spec} downloadFileName={`${preset.id}.${spec.format === "jpeg" ? "jpg" : "png"}`} />

      {siblings.length > 0 && (
        <section className="flex flex-col gap-3 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-200">Also need to resize:</span>
          <div className="flex flex-wrap gap-2">
            {siblings.map((s) => (
              <Link
                key={s.id}
                href={`/${s.id}`}
                className="group inline-flex items-center gap-1 rounded-full border border-slate-200 px-3.5 py-1.5 text-slate-600 transition-colors hover:border-brand-200 hover:text-brand-700 dark:border-white/10 dark:text-slate-300 dark:hover:border-brand-400/30 dark:hover:text-brand-300"
              >
                {s.examName} {s.documentType}
                <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Frequently asked questions
        </h2>
        <dl className="flex flex-col divide-y divide-slate-100 dark:divide-white/10">
          {faq.map((item) => (
            <div key={item.q} className="flex flex-col gap-1.5 py-4 first:pt-0">
              <dt className="font-medium text-slate-900 dark:text-white">{item.q}</dt>
              <dd className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
