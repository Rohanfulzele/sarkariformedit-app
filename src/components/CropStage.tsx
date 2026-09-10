"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
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
      <div className="relative w-full overflow-hidden rounded-xl bg-slate-900" style={{ aspectRatio: aspect, maxHeight: "60vh" }}>
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

      <div className="flex items-center gap-3">
        <label className="text-xs text-slate-500 dark:text-slate-400">Zoom</label>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!croppedAreaPixels}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          Make it ready
        </button>
      </div>
    </div>
  );
}
