"use client";

import { useCallback, useRef, useState } from "react";
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
    <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      {status === "done" && resultUrl ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Built a {items.length}-page PDF from your images.
          </p>
          <div className="flex gap-3">
            <a
              href={resultUrl}
              download="images.pdf"
              className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Download images.pdf
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
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {items.length === 0
                ? "Choose photos of your documents — one page per image"
                : `Add more images (${items.length}/${MAX_IMAGES})`}
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
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
                  className="flex cursor-grab flex-col gap-2 rounded-lg border border-slate-200 p-2 dark:border-slate-700"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.previewUrl}
                      alt={`Page ${index + 1}`}
                      className="h-full w-full object-contain"
                      style={{ transform: `rotate(${item.rotationDeg}deg)` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Page {index + 1}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => rotateItem(index)}
                        aria-label="Rotate"
                        className="rounded px-1.5 py-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                      >
                        ⟳
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        aria-label="Remove"
                        className="rounded px-1.5 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={fitToPage}
              onChange={(e) => setFitToPage(e.target.checked)}
            />
            Fit to page (crops edges to fill the page instead of leaving a margin)
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="button"
            onClick={handleConvert}
            disabled={items.length === 0 || status === "converting"}
            className="self-start rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
          >
            {status === "converting" ? "Building PDF…" : `Convert ${items.length || ""} image${items.length === 1 ? "" : "s"} to PDF`}
          </button>
        </>
      )}
    </div>
  );
}
