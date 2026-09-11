"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Download, Loader2, RotateCcw } from "lucide-react";
import { Uploader } from "./Uploader";
import { CropStage } from "./CropStage";
import { ValidationSummary } from "./ValidationSummary";
import { useImageProcessor } from "@/hooks/useImageProcessor";
import { track } from "@/lib/analytics";
import { recordDownload } from "@/lib/portal-feedback";
import { validateOutput, type ValidationCheck } from "@/lib/validate-output";
import type { ToolSpec } from "@/lib/tool-spec";
import type { CropRect } from "@/engine";

type Step = "upload" | "crop" | "result";

const STEPS: { key: Step; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "crop", label: "Crop" },
  { key: "result", label: "Download" },
];

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
  const stepIndex = STEPS.findIndex((s) => s.key === step);

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
    if (spec.id !== "custom") recordDownload(spec.id);
  };

  return (
    <div className="flex flex-col gap-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-card dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
      <ol className="flex items-center">
        {STEPS.map((s, i) => {
          const isDone = i < stepIndex;
          const isActive = i === stepIndex;
          return (
            <li key={s.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isDone
                      ? "bg-brand-600 text-white"
                      : isActive
                        ? "bg-brand-gradient text-white shadow-glow"
                        : "bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-500",
                  ].join(" ")}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span
                  className={[
                    "hidden text-sm font-medium sm:inline",
                    isActive
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-400 dark:text-slate-500",
                  ].join(" ")}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span
                  className={[
                    "mx-3 h-px flex-1 transition-colors",
                    isDone ? "bg-brand-600" : "bg-slate-200 dark:bg-white/10",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>

      {step === "upload" && <Uploader onFileReady={handleFileReady} />}

      {step === "crop" && sourceUrl && (
        <div className="flex flex-col gap-4 animate-slide-up">
          {spec.nameDateStrip?.required && (
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
              Text for the name/date strip
              <input
                type="text"
                value={stripText}
                onChange={(e) => setStripText(e.target.value)}
                placeholder={spec.nameDateStrip.exampleText}
                className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal text-slate-900 focus:border-brand-300 focus:outline-none dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
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
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing…
            </div>
          )}
          {error && <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      )}

      {step === "result" && result && resultUrl && (
        <div className="flex flex-col gap-5 animate-slide-up">
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resultUrl}
              alt="Processed output preview"
              className="max-h-72 rounded-2xl border border-slate-200 shadow-soft dark:border-white/10"
            />
          </div>

          <ValidationSummary checks={checks} warnings={result.warnings} />

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={resultUrl}
              download={downloadFileName}
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-medium text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              Download {downloadFileName}
            </a>
            <button
              type="button"
              onClick={startOver}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
