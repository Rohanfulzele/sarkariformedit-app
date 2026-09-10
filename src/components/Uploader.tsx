"use client";

import { useCallback, useRef, useState } from "react";

const MAX_FILE_SIZE_MB = 20;
const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/heic,image/heif";

interface UploaderProps {
  onFileReady: (file: Blob) => void;
}

function isHeic(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

export function Uploader({ onFileReady }: UploaderProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setError(null);

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`That file is over ${MAX_FILE_SIZE_MB} MB. Please choose a smaller photo.`);
        return;
      }

      setBusy(true);
      try {
        if (isHeic(file)) {
          const heic2any = (await import("heic2any")).default;
          const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
          const blob = Array.isArray(converted) ? converted[0] : converted;
          if (!blob) throw new Error("HEIC conversion produced no output");
          onFileReady(blob);
        } else {
          onFileReady(file);
        }
      } catch {
        setError("Could not read that image. Try a different photo or format.");
      } finally {
        setBusy(false);
      }
    },
    [onFileReady]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  return (
    <div className="w-full">
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {busy ? "Reading your photo…" : "Drag and drop a photo, or choose one below"}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => cameraInputRef.current?.click()}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
          >
            Take a photo
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => galleryInputRef.current?.click()}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Choose from gallery
          </button>
        </div>

        <input
          ref={cameraInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
