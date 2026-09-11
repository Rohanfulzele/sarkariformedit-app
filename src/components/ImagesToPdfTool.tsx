"use client";

import { useCallback, useRef, useState } from "react";
import { Download, ImagePlus, Loader2, RotateCcw, RotateCw, X } from "lucide-react";
import { imagesToPdf } from "@/pdf-engine";
import type { PageImage } from "@/pdf-engine";
import { track } from "@/lib/analytics";

const MAX_IMAGES = 20;
const MAX_FILE_SIZE_MB = 20;

interface ImageItem {
  id: string;
  blob: Blob;
  previewUrl: string;
  rotationDeg: 0 | 90 | 180 | 270;
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

const nextRotation: Record<ImageItem["rotationDeg"], ImageItem["rotationDeg"]> = {
  0: 90,
  90: 180,
  180: 270,
  270: 0,
};

export function ImagesToPdfTool() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [fitToPage, setFitToPage] = useState(false);
  const [status, setStatus] = useState<"idle" | "converting" | "done" | "error">("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const files = Array.from(fileList);
    const tooBig = files.find((f) => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (tooBig) {
      setError(`"${tooBig.name}" is over ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    const newItems: ImageItem[] = [];
    for (const file of files) {
      try {
        let blob: Blob = file;
        if (isHeic(file)) {
          const heic2any = (await import("heic2any")).default;
          const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
          blob = Array.isArray(converted) ? converted[0] ?? file : converted;
        }
        newItems.push({
          id: `${file.name}-${file.lastModified}-${Math.random()}`,
          blob,
          previewUrl: URL.createObjectURL(blob),
          rotationDeg: 0,
        });
      } catch {
        setError(`Couldn't read "${file.name}" — skipped.`);
      }
    }

    setItems((prev) => [...prev, ...newItems].slice(0, MAX_IMAGES));
  }, []);

  const rotateItem = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, rotationDeg: nextRotation[item.rotationDeg] } : item))
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const moveItem = (from: number, to: number) => {
    if (from === to) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      if (!moved) return prev;
      next.splice(to, 0, moved);
      return next;
    });
  };

  const handleConvert = async () => {
    if (items.length === 0) return;
    setStatus("converting");
    setError(null);
    try {
      const pageImages: PageImage[] = items.map((item) => ({
        file: item.blob,
        rotationDeg: item.rotationDeg,
      }));
      const blob = await imagesToPdf(pageImages, fitToPage);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setStatus("done");
      track({ name: "downloaded", presetId: "images-to-pdf" });
    } catch {
      setStatus("error");
      setError("Couldn't build the PDF from these images.");
    }
  };

  const startOver = () => {
    items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setItems([]);
    setResultUrl(null);
    setStatus("idle");
    setError(null);
  };

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-card dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
      {status === "done" && resultUrl ? (
        <div className="flex flex-col items-center gap-5 py-4 text-center animate-slide-up">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Built a {items.length}-page PDF from your images.
          </p>
          <div className="flex gap-3">
            <a
              href={resultUrl}
              download="images.pdf"
              className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-medium text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              Download images.pdf
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
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-10 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-soft dark:bg-white/5 dark:text-brand-300">
              <ImagePlus className="h-5 w-5" />
            </span>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {items.length === 0
                ? "Choose photos of your documents — one page per image"
                : `Add more images (${items.length}/${MAX_IMAGES})`}
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-medium text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Choose images
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {items.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => (dragIndex.current = index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex.current !== null) moveItem(dragIndex.current, index);
                    dragIndex.current = null;
                  }}
                  className="flex cursor-grab flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-soft transition-colors hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-100 dark:bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.previewUrl}
                      alt={`Page ${index + 1}`}
                      className="h-full w-full object-contain"
                      style={{ transform: `rotate(${item.rotationDeg}deg)` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="pl-1 font-medium text-slate-500 dark:text-slate-400">
                      Page {index + 1}
                    </span>
                    <div className="flex gap-0.5">
                      <button
                        type="button"
                        onClick={() => rotateItem(index)}
                        aria-label="Rotate"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        aria-label="Remove"
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={fitToPage}
              onChange={(e) => setFitToPage(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400 dark:border-white/20 dark:bg-white/10"
            />
            Fit to page (crops edges to fill the page instead of leaving a margin)
          </label>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="button"
            onClick={handleConvert}
            disabled={items.length === 0 || status === "converting"}
            className="inline-flex items-center gap-2 self-start rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-medium text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            {status === "converting" && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === "converting"
              ? "Building PDF…"
              : `Convert ${items.length || ""} image${items.length === 1 ? "" : "s"} to PDF`}
          </button>
        </>
      )}
    </div>
  );
}
