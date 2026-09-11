"use client";

import { useCallback, useRef, useState } from "react";
import { FileUp } from "lucide-react";

interface PdfMultiUploaderProps {
  onFilesReady: (files: File[]) => void;
  maxFiles: number;
  label: string;
}

const MAX_FILE_SIZE_MB = 50;

export function PdfMultiUploader({ onFilesReady, maxFiles, label }: PdfMultiUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
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
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="w-full">
      <div
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        className={[
          "flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 text-center transition-colors",
          dragActive
            ? "border-brand-400 bg-brand-50 dark:border-brand-400/50 dark:bg-brand-400/10"
            : "border-slate-200 bg-slate-50/60 dark:border-white/10 dark:bg-white/[0.02]",
        ].join(" ")}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-soft dark:bg-white/5 dark:text-brand-300">
          <FileUp className="h-5 w-5" />
        </span>
        <p className="text-sm text-slate-600 dark:text-slate-300">{label}</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-medium text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.98]"
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
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
