import { BadgeCheck, ExternalLink, TriangleAlert } from "lucide-react";
import { isPresetStale, type Preset } from "@presets";

export function PresetMeta({ preset }: { preset: Preset }) {
  const stale = isPresetStale(preset);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs dark:border-white/10 dark:bg-white/[0.02]">
      <div className="flex flex-wrap items-center gap-2 text-slate-500 dark:text-slate-400">
        <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
        <span>
          Source:{" "}
          <a
            href={preset.officialSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 hover:text-brand-700 dark:text-brand-300 dark:decoration-brand-400/30"
          >
            {new URL(preset.officialSourceUrl).hostname}
            <ExternalLink className="h-3 w-3" />
          </a>
        </span>
        <span aria-hidden>·</span>
        <span>Last verified {preset.lastVerifiedDate}</span>
      </div>

      {stale && (
        <div className="flex gap-2 rounded-xl bg-amber-100 px-3 py-2 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
          <TriangleAlert className="h-3.5 w-3.5 shrink-0 translate-y-0.5" />
          <p>
            This preset hasn&apos;t been re-checked in a while. Confirm the dimensions and file size
            against your current official notification before submitting.
          </p>
        </div>
      )}

      {preset.notes && <p className="italic text-slate-500 dark:text-slate-400">{preset.notes}</p>}
    </div>
  );
}
