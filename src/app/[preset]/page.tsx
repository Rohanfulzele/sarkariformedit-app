import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold capitalize text-slate-900 dark:text-slate-100 sm:text-3xl">
          {preset.examName} {docLabel} Resizer
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
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

      <section>
        <dl className="divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <div className="flex flex-col gap-1 py-2 sm:flex-row sm:gap-4">
            <dt className="shrink-0 font-medium text-slate-500 dark:text-slate-400 sm:w-32">
              Dimensions
            </dt>
            <dd>
              {preset.dimensions.widthPx} × {preset.dimensions.heightPx} px
              {preset.dimensions.physical &&
                ` (${preset.dimensions.physical.widthCm}cm × ${preset.dimensions.physical.heightCm}cm @ ${preset.dimensions.physical.dpi} DPI)`}
            </dd>
          </div>
          <div className="flex flex-col gap-1 py-2 sm:flex-row sm:gap-4">
            <dt className="shrink-0 font-medium text-slate-500 dark:text-slate-400 sm:w-32">
              File size
            </dt>
            <dd>
              {preset.fileSizeKB.min}–{preset.fileSizeKB.max} KB
            </dd>
          </div>
          <div className="flex flex-col gap-1 py-2 sm:flex-row sm:gap-4">
            <dt className="shrink-0 font-medium text-slate-500 dark:text-slate-400 sm:w-32">
              Format
            </dt>
            <dd>{preset.formats.map((f) => f.toUpperCase()).join(" or ")}</dd>
          </div>
          <div className="flex flex-col gap-1 py-2 sm:flex-row sm:gap-4">
            <dt className="shrink-0 font-medium text-slate-500 dark:text-slate-400 sm:w-32">
              Background
            </dt>
            <dd>{preset.background.description ?? preset.background.requirement}</dd>
          </div>
        </dl>
      </section>

      <PresetMeta preset={preset} />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">How it works</h2>
        <ol className="list-inside list-decimal space-y-1 text-sm text-slate-600 dark:text-slate-300">
          <li>Take a photo or choose one from your gallery.</li>
          <li>Crop it to fit the required frame.</li>
          <li>Download the file — it&apos;s already the right size and format.</li>
        </ol>
      </section>

      <ToolFlowLazy spec={spec} downloadFileName={`${preset.id}.${spec.format === "jpeg" ? "jpg" : "png"}`} />

      {siblings.length > 0 && (
        <section className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span>Also need to resize:</span>
          <div className="flex flex-wrap gap-3">
            {siblings.map((s) => (
              <Link key={s.id} href={`/${s.id}`} className="text-brand underline dark:text-blue-400">
                {s.examName} {s.documentType}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Frequently asked questions
        </h2>
        <dl className="flex flex-col gap-4">
          {faq.map((item) => (
            <div key={item.q}>
              <dt className="font-medium text-slate-900 dark:text-slate-100">{item.q}</dt>
              <dd className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
