"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Download, Loader2, RotateCcw } from "lucide-react";
import { PdfMultiUploader } from "./PdfMultiUploader";
import { compressPdf, renderFirstPagePreview } from "@/pdf-engine";
import type { CompressPdfResult } from "@/pdf-engine";
import { track } from "@/lib/analytics";

interface CompressPdfToolProps {
  targetKB: number;
}

export function CompressPdfTool({ targetKB }: CompressPdfToolProps) {
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState<string | null>(null);
  const [result, setResult] = useState<CompressPdfResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  const handleFile = async ([file]: File[]) => {
    if (!file) return;
    setStatus("processing");
    setError(null);
    setProgress("Reading PDF…");

    try {
      const compressed = await compressPdf(file, {
        targetKB,
        onProgress: setProgress,
      });
      setResult(compressed);

      const bytes = new Uint8Array(await compressed.blob.arrayBuffer());
      const preview = await renderFirstPagePreview(bytes);
      setPreviewUrl(preview.dataUrl);

      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      const url = URL.createObjectURL(compressed.blob);
      resultUrlRef.current = url;
      setResultUrl(url);
      setStatus("done");
      track({ name: "downloaded", presetId: `compress-pdf-${targetKB}kb` });
    } catch (err) {
      console.error("[compress-pdf]", err);
      setStatus("error");
      setError("Couldn't compress this PDF. Make sure it's a valid, unencrypted PDF file.");
    }
  };

  const startOver = () => {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = null;
    setResult(null);
    setResultUrl(null);
    setPreviewUrl(null);
    setStatus("idle");
    setError(null);
  };

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-card dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
      {status === "idle" && (
        <PdfMultiUploader
          onFilesReady={handleFile}
          maxFiles={1}
          label={`Choose a PDF to compress to under ${targetKB} KB`}
        />
      )}

      {status === "processing" && (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          <p className="text-sm text-slate-500 dark:text-slate-400">{progress ?? "Compressing…"}</p>
        </div>
      )}

      {error && <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>}

      {status === "done" && result && resultUrl && (
        <div className="flex flex-col gap-5 animate-slide-up">
          {previewUrl && (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Page 1 preview of the compressed PDF"
                className="max-h-96 rounded-2xl border border-slate-200 shadow-soft dark:border-white/10"
              />
            </div>
          )}

          <div className="flex items-center justify-center gap-4 rounded-2xl border border-slate-200 p-4 text-sm dark:border-white/10">
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Original
              </p>
              <p className="font-semibold text-slate-500 line-through dark:text-slate-400">
                {(result.originalBytes / 1024).toFixed(0)} KB
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Compressed
              </p>
              <p
                className={
                  result.reachedTarget
                    ? "text-lg font-bold text-emerald-600 dark:text-emerald-400"
                    : "text-lg font-bold text-amber-600 dark:text-amber-400"
                }
              >
                {(result.finalBytes / 1024).toFixed(0)} KB
              </p>
            </div>
          </div>

          {!result.reachedTarget && (
            <div className="flex gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0 translate-y-0.5 text-amber-500" />
              <p>
                Couldn&apos;t get this under {targetKB} KB without the file becoming unusable. This
                is the smallest we could make it while keeping it readable — check whether your
                portal accepts this size before submitting.
              </p>
            </div>
          )}

          {result.rasterized && (
            <div className="flex gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0 translate-y-0.5 text-amber-500" />
              <p>
                To reach this size, pages were converted to images
                {result.dpiUsed ? ` (${result.dpiUsed} DPI)` : ""}. Text in this PDF is no longer
                selectable or searchable.
              </p>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={resultUrl}
              download="compressed.pdf"
              className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-medium text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              Download compressed.pdf
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
