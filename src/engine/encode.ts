import { padJpegToMinSize } from "./jpeg-padding";
import type { OutputFormat, ProcessWarning } from "./types";

const MIN_QUALITY = 0.1;
const MAX_QUALITY = 0.95;
const MAX_ITERATIONS = 8;

export async function encodeToTargetSize(
  canvas: OffscreenCanvas,
  format: OutputFormat,
  targetKB: { min: number; max: number }
): Promise<{ blob: Blob; warnings: ProcessWarning[] }> {
  const warnings: ProcessWarning[] = [];
  const minBytes = targetKB.min * 1024;
  const maxBytes = targetKB.max * 1024;

  if (format === "png") {
    const blob = await canvas.convertToBlob({ type: "image/png" });
    if (blob.size > maxBytes) {
      warnings.push({
        type: "could_not_reach_max_size",
        achievedBytes: blob.size,
        targetMaxBytes: maxBytes,
      });
    }
    return { blob, warnings };
  }

  let low = MIN_QUALITY;
  let high = MAX_QUALITY;
  let best: Blob | null = null;
  let bestDiff = Infinity;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const quality = (low + high) / 2;
    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality });

    if (blob.size >= minBytes && blob.size <= maxBytes) {
      return { blob, warnings };
    }

    const diff = blob.size < minBytes ? minBytes - blob.size : blob.size - maxBytes;
    if (diff < bestDiff) {
      bestDiff = diff;
      best = blob;
    }

    if (blob.size > maxBytes) {
      high = quality;
    } else {
      low = quality;
    }
  }

  if (!best) {
    best = await canvas.convertToBlob({ type: "image/jpeg", quality: MIN_QUALITY });
  }

  if (best.size < minBytes) {
    const before = best.size;
    best = await padJpegToMinSize(best, minBytes);
    warnings.push({ type: "padded_to_min_size", addedBytes: best.size - before });
  } else if (best.size > maxBytes) {
    warnings.push({
      type: "could_not_reach_max_size",
      achievedBytes: best.size,
      targetMaxBytes: maxBytes,
    });
  }

  return { blob: best, warnings };
}
