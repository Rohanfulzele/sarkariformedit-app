import type { DocumentKind, OutputFormat } from "@/engine";
import type { Preset } from "@presets";

export interface ToolSpec {
  id: string;
  documentType: DocumentKind;
  widthPx: number;
  heightPx: number;
  minKB: number;
  maxKB: number;
  format: OutputFormat;
  nameDateStrip?: { required: boolean; exampleText?: string };
}

export function presetToToolSpec(preset: Preset): ToolSpec {
  return {
    id: preset.id,
    documentType: preset.documentType,
    widthPx: preset.dimensions.widthPx,
    heightPx: preset.dimensions.heightPx,
    minKB: preset.fileSizeKB.min,
    maxKB: preset.fileSizeKB.max,
    format: preset.formats.includes("jpeg") ? "jpeg" : "png",
    nameDateStrip: preset.nameDateStrip,
  };
}
