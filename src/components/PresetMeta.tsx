import { isPresetStale, type Preset } from "@presets";

export function PresetMeta({ preset }: { preset: Preset }) {
  const stale = isPresetStale(preset);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
      <div className="flex flex-wrap items-center gap-2">
        <span>
          Source:{" "}
          <a
            href={preset.officialSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand underline hover:text-brand-dark dark:text-blue-400 dark:hover:text-blue-300"
          >
            {new URL(preset.officialSourceUrl).hostname}
          </a>
        </span>
        <span aria-hidden>·</span>
        <span>Last verified {preset.lastVerifiedDate}</span>
      </div>

      {stale && (
        <p className="rounded bg-amber-100 px-2 py-1 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
          This preset hasn&apos;t been re-checked in a while. Confirm the dimensions and file size
          against your current official notification before submitting.
        </p>
      )}

      {preset.notes && <p className="italic">{preset.notes}</p>}
    </div>
  );
}
