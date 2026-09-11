"use client";

import { useCallback, useRef, useState } from "react";

interface PdfMultiUploaderProps {
  onFilesReady: (files: File[]) => void;
  maxFiles: number;
  label: string;
}

const MAX_FILE_SIZE_MB = 50;

export function PdfMultiUploader({ onFilesReady, maxFiles, label }: PdfMultiUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      setError(null);

      const files = Array.from(fileList).filter((f) => f.type === "application/pdf");
      if (files.length === 0) {
        setError("Please choose PDF files.");
        return;
      }
      if (files.length > maxFiles) {
        setError(`You can add up to ${maxFiles} files at once.`);
        return;
      }
      const tooBig = files.find((f) => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
      if (tooBig) {
        setError(`"${tooBig.name}" is over ${MAX_FILE_SIZE_MB} MB.`);
        return;
      }

      onFilesReady(files);
    },
    [maxFiles, onFilesReady]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="w-full">
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">{label}</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          Choose PDF{maxFiles > 1 ? "s" : ""}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple={maxFiles > 1}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
