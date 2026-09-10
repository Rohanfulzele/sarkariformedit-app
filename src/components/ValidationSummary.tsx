import type { ProcessWarning } from "@/engine";
import type { ValidationCheck } from "@/lib/validate-output";

function warningText(warning: ProcessWarning): string {
  switch (warning.type) {
    case "upscaled":
      return `Your source photo (${warning.sourceMaxDimensionPx}px) is smaller than the required ${warning.targetMaxDimensionPx}px. It's been enlarged to fit — for a sharper result, retake the photo closer up or in better light.`;
    case "padded_to_min_size":
      return `The compressed file was slightly under the minimum size, so ${(warning.addedBytes / 1024).toFixed(1)} KB of invisible padding was added to meet the portal's minimum. This doesn't change how the image looks.`;
    case "could_not_reach_max_size":
      return `Couldn't compress below ${(warning.targetMaxBytes / 1024).toFixed(0)} KB without visibly degrading the image. Closest achievable size: ${(warning.achievedBytes / 1024).toFixed(1)} KB.`;
    case "low_source_resolution":
      return `Source resolution (${warning.sourceWidthPx}×${warning.sourceHeightPx}px) is quite low. Consider retaking the photo for a sharper result.`;
  }
}

interface ValidationSummaryProps {
  checks: ValidationCheck[];
  warnings: ProcessWarning[];
}

export function ValidationSummary({ checks, warnings }: ValidationSummaryProps) {
  return (
    <div className="flex flex-col gap-3">
      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
        {checks.map((check) => (
          <li key={check.label} className="flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{check.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{check.detail}</p>
            </div>
            <span
              className={
                check.pass
                  ? "shrink-0 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  : "shrink-0 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300"
              }
            >
              {check.pass ? "Pass" : "Fail"}
            </span>
          </li>
        ))}
      </ul>

      {warnings.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-900/30">
          {warnings.map((warning, i) => (
            <p key={i} className="text-xs text-amber-800 dark:text-amber-200">
              {warningText(warning)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
