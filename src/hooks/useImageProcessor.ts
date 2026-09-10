"use client";

import { useCallback, useState } from "react";
import { processImageInWorker, type ProcessImageRequest, type ProcessImageResult } from "@/engine";

type Status = "idle" | "processing" | "done" | "error";

export function useImageProcessor() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ProcessImageResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const process = useCallback(async (request: ProcessImageRequest) => {
    setStatus("processing");
    setError(null);
    try {
      const processed = await processImageInWorker(request);
      setResult(processed);
      setStatus("done");
      return processed;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Processing failed";
      setError(message);
      setStatus("error");
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, process, reset };
}
