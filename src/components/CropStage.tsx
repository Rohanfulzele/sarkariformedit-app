"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { ArrowLeft, Check, ZoomIn, ZoomOut } from "lucide-react";
import type { CropRect } from "@/engine";

interface CropStageProps {
  imageSrc: string;
  aspect: number;
  showFaceGuide: boolean;
  onConfirm: (crop: CropRect) => void;
  onCancel: () => void;
}

export function CropStage({ imageSrc, aspect, showFaceGuide, onConfirm, onCancel }: CropStageProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = () => {
    if (!croppedAreaPixels) return;
    onConfirm({
      x: Math.round(croppedAreaPixels.x),
      y: Math.round(croppedAreaPixels.y),
      width: Math.round(croppedAreaPixels.width),
      height: Math.round(croppedAreaPixels.height),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative w-full overflow-hidden rounded-2xl bg-slate-900"
        style={{ aspectRatio: aspect, maxHeight: "60vh" }}
      >
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
        {showFaceGuide && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="h-[85%] w-[85%] opacity-70">
              <ellipse
                cx="50"
                cy="42"
                rx="26"
                ry="34"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            </svg>
          </div>
        )}
      </div>

      {showFaceGuide && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Line up your face inside the dashed oval, looking straight at the camera.
        </p>
      )}

      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
        <ZoomOut className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600 dark:bg-white/10"
        />
        <ZoomIn className="h-4 w-4 shrink-0 text-slate-400" />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!croppedAreaPixels}
          className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-medium text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
        >
          <Check className="h-3.5 w-3.5" />
          Make it ready
        </button>
      </div>
    </div>
  );
}
