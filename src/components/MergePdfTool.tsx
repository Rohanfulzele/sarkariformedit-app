"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronUp, Download, FileText, GripVertical, Loader2, RotateCcw, X } from "lucide-react";
import { PdfMultiUploader } from "./PdfMultiUploader";
import { mergePdfs } from "@/pdf-engine";
import { track } from "@/lib/analytics";

const MAX_FILES = 20;

export function MergePdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "merging" | "done" | "error">("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);

  const handleFilesReady = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles].slice(0, MAX_FILES));
  };

  const moveItem = (from: number, to: number) => {
    if (from === to) return;
    setFiles((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      if (!moved) return prev;
      next.splice(to, 0, moved);
      return next;
    });
  };

  const removeItem = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setStatus("merging");
    setError(null);
    try {
      const blob = await mergePdfs(files);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setStatus("done");
      track({ name: "downloaded", presetId: "merge-pdf" });
    } catch {
      setStatus("error");
      setError("Couldn't merge these PDFs. Make sure they're valid, unencrypted PDF files.");
    }
  };

  const startOver = () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFiles([]);
    setResultUrl(null);
    setStatus("idle");
    setError(null);
  };

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-card dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
      {status === "done" && resultUrl ? (
        <div className="flex flex-col items-center gap-5 py-4 text-center animate-slide-up">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Merged {files.length} PDFs into one file.
          </p>
          <div className="flex gap-3">
            <a
              href={resultUrl}
              download="merged.pdf"
              className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-medium text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              Download merged.pdf
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
      ) : (
        <>
          <PdfMultiUploader
            onFilesReady={handleFilesReady}
            maxFiles={MAX_FILES}
            label={
              files.length === 0
                ? "Add 2 or more PDFs to merge"
                : `Add more PDFs (${files.length}/${MAX_FILES})`
            }
          />

          {files.length > 0 && (
            <ul className="flex flex-col gap-2">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  draggable
                  onDragStart={() => (dragIndex.current = index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex.current !== null) moveItem(dragIndex.current, index);
                    dragIndex.current = null;
                  }}
                  className="flex cursor-grab items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm transition-colors hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20"
                >
                  <GripVertical className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-400/10 dark:text-brand-300">
                    <FileText className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-slate-700 dark:text-slate-200">
                    {file.name}
                  </span>
                  <div className="flex shrink-0 gap-0.5">
                    <button
                      type="button"
                      onClick={() => index > 0 && moveItem(index, index - 1)}
                      disabled={index === 0}
                      aria-label="Move up"
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-white/10"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => index < files.length - 1 && moveItem(index, index + 1)}
                      disabled={index === files.length - 1}
                      aria-label="Move down"
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-white/10"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      aria-label="Remove"
                      className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="button"
            onClick={handleMerge}
            disabled={files.length < 2 || status === "merging"}
            className="inline-flex items-center gap-2 self-start rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-medium text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            {status === "merging" && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === "merging" ? "Merging…" : `Merge ${files.length || ""} PDFs`}
          </button>
        </>
      )}
    </div>
  );
}
