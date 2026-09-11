"use client";

import { useEffect, useState } from "react";
import { Uploader } from "./Uploader";
import { CropStage } from "./CropStage";
import { idCardToPdf } from "@/pdf-engine";
import { cropImageToBlob } from "@/pdf-engine/crop-to-blob";
import { track } from "@/lib/analytics";
import type { CropRect } from "@/engine";

const CARD_ASPECT = 242.65 / 153.02; // ID-1 card ratio (85.6mm x 53.98mm)

type Step = "upload-front" | "crop-front" | "upload-back" | "crop-back" | "result";

export function IdCardTool() {
  const [step, setStep] = useState<Step>("upload-front");
  const [frontSourceUrl, setFrontSourceUrl] = useState<string | null>(null);
  const [backSourceUrl, setBackSourceUrl] = useState<string | null>(null);
  const [frontCropped, setFrontCropped] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
    <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <p className="text-xs text-amber-700 dark:text-amber-300">
        Only upload a masked/redacted copy of your ID where the recipient accepts one — cover
        numbers you don&apos;t need to show.
      </p>

      {step === "upload-front" && (
        <>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Step 1 of 2 — front of the card
          </p>
          <Uploader onFileReady={handleFrontFile} />
        </>
      )}

      {step === "crop-front" && frontSourceUrl && (
        <>
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
        </>
      )}

      {step === "upload-back" && (
        <>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Step 2 of 2 — back of the card
          </p>
          <Uploader onFileReady={handleBackFile} />
        </>
      )}

      {step === "crop-back" && backSourceUrl && (
        <>
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
          {busy && <p className="text-sm text-slate-500 dark:text-slate-400">Building PDF…</p>}
        </>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {step === "result" && resultUrl && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Front and back placed on one A4 page at real card size.
          </p>
          <div className="flex gap-3">
            <a
              href={resultUrl}
              download="id-card.pdf"
              className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Download id-card.pdf
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
      )}
    </div>
  );
}
