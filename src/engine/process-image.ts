import { cleanupSignatureBackground, cropAndScale, decodeImage, drawNameDateStrip } from "./canvas-ops";
import { encodeToTargetSize } from "./encode";
import type { ProcessImageRequest, ProcessImageResult, ProcessWarning } from "./types";

const RESOLUTION_TOLERANCE = 0.97;

export async function processImage(req: ProcessImageRequest): Promise<ProcessImageResult> {
  const warnings: ProcessWarning[] = [];
  const source = await decodeImage(req.fileBuffer);

  if (
    req.crop.width < req.targetWidthPx * RESOLUTION_TOLERANCE ||
    req.crop.height < req.targetHeightPx * RESOLUTION_TOLERANCE
  ) {
    warnings.push({
      type: "upscaled",
      sourceMaxDimensionPx: Math.max(req.crop.width, req.crop.height),
      targetMaxDimensionPx: Math.max(req.targetWidthPx, req.targetHeightPx),
    });
  }

  const stripHeightPx = req.nameDateStrip
    ? Math.round(req.targetHeightPx * (req.nameDateStrip.heightRatio ?? 0.12))
    : 0;

  let finalCanvas: OffscreenCanvas;

  if (req.documentType === "signature" && req.cleanupSignatureBackground) {
    const workingCanvas = new OffscreenCanvas(req.crop.width, req.crop.height);
    const workingCtx = workingCanvas.getContext("2d");
    if (!workingCtx) throw new Error("2D canvas context unavailable");
    workingCtx.fillStyle = "#ffffff";
    workingCtx.fillRect(0, 0, req.crop.width, req.crop.height);
    workingCtx.drawImage(
      source,
      req.crop.x,
      req.crop.y,
      req.crop.width,
      req.crop.height,
      0,
      0,
      req.crop.width,
      req.crop.height
    );

    const { croppedCanvas } = cleanupSignatureBackground(workingCanvas);

    finalCanvas = new OffscreenCanvas(req.targetWidthPx, req.targetHeightPx);
    const finalCtx = finalCanvas.getContext("2d");
    if (!finalCtx) throw new Error("2D canvas context unavailable");
    finalCtx.fillStyle = "#ffffff";
    finalCtx.fillRect(0, 0, req.targetWidthPx, req.targetHeightPx);
    finalCtx.drawImage(
      croppedCanvas,
      0,
      0,
      croppedCanvas.width,
      croppedCanvas.height,
      0,
      0,
      req.targetWidthPx,
      req.targetHeightPx
    );
  } else {
    finalCanvas = cropAndScale(source, req.crop, req.targetWidthPx, req.targetHeightPx, stripHeightPx);
  }

  if (req.nameDateStrip) {
    drawNameDateStrip(finalCanvas, req.nameDateStrip.text, stripHeightPx);
  }

  const { blob, warnings: encodeWarnings } = await encodeToTargetSize(
    finalCanvas,
    req.outputFormat,
    req.targetSizeKB
  );
  warnings.push(...encodeWarnings);

  return {
    blob,
    actualWidthPx: req.targetWidthPx,
    actualHeightPx: req.targetHeightPx,
    actualSizeBytes: blob.size,
    formatUsed: req.outputFormat,
    warnings,
  };
}
