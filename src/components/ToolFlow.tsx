"use client";

import { useEffect, useMemo, useState } from "react";
import { Uploader } from "./Uploader";
import { CropStage } from "./CropStage";
import { ValidationSummary } from "./ValidationSummary";
import { useImageProcessor } from "@/hooks/useImageProcessor";
import { track } from "@/lib/analytics";
import { validateOutput, type ValidationCheck } from "@/lib/validate-output";
import type { ToolSpec } from "@/lib/tool-spec";
import type { CropRect } from "@/engine";

type Step = "upload" | "crop" | "result";

interface ToolFlowProps {
  spec: ToolSpec;
  downloadFileName: string;
}

export function ToolFlow({ spec, downloadFileName }: ToolFlowProps) {
  const [step, setStep] = useState<Step>("upload");
  const [sourceBlob, setSourceBlob] = useState<Blob | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [stripText, setStripText] = useState(spec.nameDateStrip?.exampleText ?? "");
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const { status, result, error, process, reset } = useImageProcessor();

  const aspect = spec.widthPx / spec.heightPx;

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileReady = (blob: Blob) => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceBlob(blob);
    setSourceUrl(URL.createObjectURL(blob));
    setStep("crop");
    track({ name: "file_added", presetId: spec.id, documentType: spec.documentType });
  };

  const handleCropConfirm = async (crop: CropRect) => {
    if (!sourceBlob) return;
    const startedAt = performance.now();
    try {
      const buffer = await sourceBlob.arrayBuffer();
      const processed = await process({
        fileBuffer: buffer,
        crop,
        targetWidthPx: spec.widthPx,
        targetHeightPx: spec.heightPx,
        targetSizeKB: { min: spec.minKB, max: spec.maxKB },
        outputFormat: spec.format,
        documentType: spec.documentType,
        cleanupSignatureBackground: spec.documentType === "signature",
        nameDateStrip: spec.nameDateStrip?.required ? { text: stripText } : null,
      });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(processed.blob));
      setStep("result");
      track({ name: "processed", presetId: spec.id, durationMs: Math.round(performance.now() - startedAt) });
    } catch {
      track({ name: "error", presetId: spec.id, errorType: "processing_failed" });
    }
  };

  const startOver = () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setSourceBlob(null);
    setSourceUrl(null);
    setResultUrl(null);
    reset();
    setStep("upload");
  };

  const checks: ValidationCheck[] = useMemo(() => {
    if (!result) return [];
    return validateOutput(spec, result);
  }, [result, spec]);

  useEffect(() => {
    if (result) {
      track({ name: "validated", presetId: spec.id, passed: checks.every((c) => c.pass) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const handleDownload = () => {
    track({ name: "downloaded", presetId: spec.id });
  };

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      {step === "upload" && <Uploader onFileReady={handleFileReady} />}

      {step === "crop" && sourceUrl && (
        <div className="flex flex-col gap-4">
          {spec.nameDateStrip?.required && (
            <label className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-200">
              Text for the name/date strip
              <input
                type="text"
                value={stripText}
                onChange={(e) => setStripText(e.target.value)}
                placeholder={spec.nameDateStrip.exampleText}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
          )}
          <CropStage
            imageSrc={sourceUrl}
            aspect={aspect}
            showFaceGuide={spec.documentType === "photo"}
            onConfirm={handleCropConfirm}
            onCancel={startOver}
          />
          {status === "processing" && (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">Processing…</p>
          )}
          {error && <p className="text-center text-sm text-red-600">{error}</p>}
        </div>
      )}

      {step === "result" && result && resultUrl && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resultUrl}
              alt="Processed output preview"
              className="max-h-72 rounded-lg border border-slate-200 dark:border-slate-700"
            />
          </div>

          <ValidationSummary checks={checks} warnings={result.warnings} />

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={resultUrl}
              download={downloadFileName}
              onClick={handleDownload}
              className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Download {downloadFileName}
            </a>
            <button
              type="button"
              onClick={startOver}
              className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
