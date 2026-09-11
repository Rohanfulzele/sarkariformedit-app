"use client";

import { useEffect, useRef, useState } from "react";
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
    <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      {status === "idle" && (
        <PdfMultiUploader onFilesReady={handleFile} maxFiles={1} label={`Choose a PDF to compress to under ${targetKB} KB`} />
      )}

      {status === "processing" && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          {progress ?? "Compressing…"}
        </p>
      )}

      {error && <p className="text-center text-sm text-red-600">{error}</p>}

      {status === "done" && result && resultUrl && (
        <div className="flex flex-col gap-4">
          {previewUrl && (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Page 1 preview of the compressed PDF"
                className="max-h-96 rounded-lg border border-slate-200 shadow-sm dark:border-slate-700"
              />
            </div>
          )}

          <div className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 text-sm dark:border-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Original size</span>
              <span>{(result.originalBytes / 1024).toFixed(0)} KB</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-500 dark:text-slate-400">Compressed size</span>
              <span className={result.reachedTarget ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"}>
                {(result.finalBytes / 1024).toFixed(0)} KB
              </span>
            </div>
          </div>

          {!result.reachedTarget && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
              Couldn&apos;t get this under {targetKB} KB without the file becoming unusable. This is
              the smallest we could make it while keeping it readable — check whether your portal
              accepts this size before submitting.
            </div>
          )}

          {result.rasterized && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
              To reach this size, pages were converted to images{result.dpiUsed ? ` (${result.dpiUsed} DPI)` : ""}.
              Text in this PDF is no longer selectable or searchable.
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={resultUrl}
              download="compressed.pdf"
              className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Download compressed.pdf
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
