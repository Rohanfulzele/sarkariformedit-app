"use client";

import { useRef, useState } from "react";
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
    <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      {status === "done" && resultUrl ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Merged {files.length} PDFs into one file.
          </p>
          <div className="flex gap-3">
            <a
              href={resultUrl}
              download="merged.pdf"
              className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Download merged.pdf
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
                  className="flex cursor-grab items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
                >
                  <span className="truncate text-slate-700 dark:text-slate-200">
                    {index + 1}. {file.name}
                  </span>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => index > 0 && moveItem(index, index - 1)}
                      disabled={index === 0}
                      aria-label="Move up"
                      className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => index < files.length - 1 && moveItem(index, index + 1)}
                      disabled={index === files.length - 1}
                      aria-label="Move down"
                      className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      aria-label="Remove"
                      className="rounded px-2 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="button"
            onClick={handleMerge}
            disabled={files.length < 2 || status === "merging"}
            className="self-start rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {status === "merging" ? "Merging…" : `Merge ${files.length || ""} PDFs`}
          </button>
        </>
      )}
    </div>
  );
}
