export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type OutputFormat = "jpeg" | "png";
export type DocumentKind = "photo" | "signature" | "thumb_impression" | "declaration";

export interface NameDateStripOptions {
  text: string;
  heightRatio?: number;
}

export interface ProcessImageRequest {
  fileBuffer: ArrayBuffer;
  crop: CropRect;
  targetWidthPx: number;
  targetHeightPx: number;
  targetSizeKB: { min: number; max: number };
  outputFormat: OutputFormat;
  documentType: DocumentKind;
  cleanupSignatureBackground?: boolean;
  nameDateStrip?: NameDateStripOptions | null;
}

export type ProcessWarning =
  | { type: "upscaled"; sourceMaxDimensionPx: number; targetMaxDimensionPx: number }
  | { type: "padded_to_min_size"; addedBytes: number }
  | { type: "could_not_reach_max_size"; achievedBytes: number; targetMaxBytes: number }
  | { type: "low_source_resolution"; sourceWidthPx: number; sourceHeightPx: number };

export interface ProcessImageResult {
  blob: Blob;
  actualWidthPx: number;
  actualHeightPx: number;
  actualSizeBytes: number;
  formatUsed: OutputFormat;
  warnings: ProcessWarning[];
}

export type WorkerRequestMessage = {
  id: string;
  type: "process";
  payload: ProcessImageRequest;
};

export type WorkerResponseMessage =
  | { id: string; type: "result"; payload: ProcessImageResult }
  | { id: string; type: "error"; message: string };
