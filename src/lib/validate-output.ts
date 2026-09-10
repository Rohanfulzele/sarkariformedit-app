import type { ProcessImageResult } from "@/engine";
import type { ToolSpec } from "@/lib/tool-spec";

export interface ValidationCheck {
  label: string;
  pass: boolean;
  detail: string;
}

export function validateOutput(spec: ToolSpec, result: ProcessImageResult): ValidationCheck[] {
  const sizeKB = result.actualSizeBytes / 1024;
  const dimensionsPass =
    result.actualWidthPx === spec.widthPx && result.actualHeightPx === spec.heightPx;
  const sizePass = sizeKB >= spec.minKB && sizeKB <= spec.maxKB;
  const formatPass = result.formatUsed === spec.format;

  return [
    {
      label: "Dimensions",
      pass: dimensionsPass,
      detail: `${result.actualWidthPx}×${result.actualHeightPx}px (required ${spec.widthPx}×${spec.heightPx}px)`,
    },
    {
      label: "File size",
      pass: sizePass,
      detail: `${sizeKB.toFixed(1)} KB (required ${spec.minKB}–${spec.maxKB} KB)`,
    },
    {
      label: "Format",
      pass: formatPass,
      detail: `${result.formatUsed.toUpperCase()} (required: ${spec.format.toUpperCase()})`,
    },
  ];
}

export function allChecksPass(checks: ValidationCheck[]): boolean {
  return checks.every((c) => c.pass);
}
