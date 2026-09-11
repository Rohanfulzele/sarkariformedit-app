"use client";

import { useEffect, useState } from "react";
import { Check, Download, Loader2, RotateCcw, ShieldAlert } from "lucide-react";
import { Uploader } from "./Uploader";
import { CropStage } from "./CropStage";
import { idCardToPdf } from "@/pdf-engine";
import { cropImageToBlob } from "@/pdf-engine/crop-to-blob";
import { track } from "@/lib/analytics";
import type { CropRect } from "@/engine";

const CARD_ASPECT = 242.65 / 153.02; // ID-1 card ratio (85.6mm x 53.98mm)

type Step = "upload-front" | "crop-front" | "upload-back" | "crop-back" | "result";

const PHASES: { key: "front" | "back" | "result"; label: string }[] = [
  { key: "front", label: "Front" },
  { key: "back", label: "Back" },
  { key: "result", label: "Download" },
];

function phaseFor(step: Step): "front" | "back" | "result" {
  if (step === "upload-front" || step === "crop-front") return "front";
  if (step === "upload-back" || step === "crop-back") return "back";
  return "result";
}

export function IdCardTool() {
  const [step, setStep] = useState<Step>("upload-front");
  const [frontSourceUrl, setFrontSourceUrl] = useState<string | null>(null);
  const [backSourceUrl, setBackSourceUrl] = useState<string | null>(null);
  const [frontCropped, setFrontCropped] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const phaseIndex = PHASES.findIndex((p) => p.key === phaseFor(step));

  useEffect(() => {
    return () => {
      if (frontSourceUrl) URL.revokeObjectURL(frontSourceUrl);
      if (backSourceUrl) URL.revokeObjectURL(backSourceUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFrontFile = (blob: Blob) => {
    setFrontSourceUrl(URL.createObjectURL(blob));
    setStep("crop-front");
  };

  const handleBackFile = (blob: Blob) => {
    setBackSourceUrl(URL.createObjectURL(blob));
    setStep("crop-back");
  };

  const handleFrontCropConfirm = async (crop: CropRect) => {
    if (!frontSourceUrl) return;
    const cropped = await cropImageToBlob(frontSourceUrl, crop);
    setFrontCropped(cropped);
    setStep("upload-back");
  };

  const handleBackCropConfirm = async (crop: CropRect) => {
    if (!backSourceUrl) return;
    setBusy(true);
    setError(null);
    try {
      const cropped = await cropImageToBlob(backSourceUrl, crop);
      const front = frontCropped;
      if (!front) throw new Error("Missing front image");
      const blob = await idCardToPdf(front, cropped);
      setResultUrl(URL.createObjectURL(blob));
      setStep("result");
      track({ name: "downloaded", presetId: "id-card-pdf" });
    } catch {
      setError("Couldn't build the PDF from these images.");
    } finally {
      setBusy(false);
    }
  };

  const startOver = () => {
    if (frontSourceUrl) URL.revokeObjectURL(frontSourceUrl);
    if (backSourceUrl) URL.revokeObjectURL(backSourceUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFrontSourceUrl(null);
    setBackSourceUrl(null);
    setFrontCropped(null);
    setResultUrl(null);
    setError(null);
    setStep("upload-front");
  };

  return (
    <div className="flex flex-col gap-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-card dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
      <ol className="flex items-center">
        {PHASES.map((p, i) => {
          const isDone = i < phaseIndex;
          const isActive = i === phaseIndex;
          return (
            <li key={p.key} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isDone
                      ? "bg-brand-600 text-white"
                      : isActive
                        ? "bg-brand-gradient text-white shadow-glow"
                        : "bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-500",
                  ].join(" ")}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span
                  className={[
                    "hidden text-sm font-medium sm:inline",
                    isActive ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500",
                  ].join(" ")}
                >
                  {p.label}
                </span>
              </div>
              {i < PHASES.length - 1 && (
                <span
                  className={[
                    "mx-3 h-px flex-1 transition-colors",
                    isDone ? "bg-brand-600" : "bg-slate-200 dark:bg-white/10",
                  ].join(" ")}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
        <ShieldAlert className="h-4 w-4 shrink-0 translate-y-0.5 text-amber-500" />
        <p>
          Only upload a masked/redacted copy of your ID where the recipient accepts one — cover
          numbers you don&apos;t need to show.
        </p>
      </div>

      {step === "upload-front" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Step 1 of 2 — front of the card
          </p>
          <Uploader onFileReady={handleFrontFile} />
        </div>
      )}

      {step === "crop-front" && frontSourceUrl && (
        <div className="flex flex-col gap-4 animate-slide-up">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Crop to the card&apos;s edges
          </p>
          <CropStage
            imageSrc={frontSourceUrl}
            aspect={CARD_ASPECT}
            showFaceGuide={false}
            onConfirm={handleFrontCropConfirm}
            onCancel={startOver}
          />
        </div>
      )}

      {step === "upload-back" && (
        <div className="flex flex-col gap-4 animate-slide-up">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Step 2 of 2 — back of the card
          </p>
          <Uploader onFileReady={handleBackFile} />
        </div>
      )}

      {step === "crop-back" && backSourceUrl && (
        <div className="flex flex-col gap-4 animate-slide-up">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Crop to the card&apos;s edges
          </p>
          <CropStage
            imageSrc={backSourceUrl}
            aspect={CARD_ASPECT}
            showFaceGuide={false}
            onConfirm={handleBackCropConfirm}
            onCancel={() => setStep("upload-back")}
          />
          {busy && (
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Building PDF…
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {step === "result" && resultUrl && (
        <div className="flex flex-col items-center gap-5 py-4 text-center animate-slide-up">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Front and back placed on one A4 page at real card size.
          </p>
          <div className="flex gap-3">
            <a
              href={resultUrl}
              download="id-card.pdf"
              className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-medium text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              Download id-card.pdf
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
      )}
    </div>
  );
}
