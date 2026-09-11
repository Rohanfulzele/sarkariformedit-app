import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
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
      <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 dark:divide-white/10 dark:border-white/10">
        {checks.map((check) => (
          <li key={check.label} className="flex items-center gap-3 px-4 py-3">
            {check.pass ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-red-500" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{check.label}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{check.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      {warnings.length > 0 && (
        <div className="flex flex-col gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-400/20 dark:bg-amber-400/10">
          {warnings.map((warning, i) => (
            <div key={i} className="flex gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 translate-y-0.5 text-amber-500" />
              <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200">
                {warningText(warning)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
