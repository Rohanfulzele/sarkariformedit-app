import { processImage } from "./process-image";
import type { WorkerRequestMessage, WorkerResponseMessage } from "./types";

// `self` under the default (dom) tsconfig lib is typed as Window, which
// conflicts with the webworker lib if pulled in globally. Casting locally
// avoids mixing "dom" and "webworker" libs project-wide just for this file.
interface WorkerContext {
  postMessage(message: WorkerResponseMessage): void;
  onmessage: ((event: MessageEvent<WorkerRequestMessage>) => void) | null;
}

const ctx = self as unknown as WorkerContext;

ctx.onmessage = async (event) => {
  const { id, payload } = event.data;
  try {
    const result = await processImage(payload);
    ctx.postMessage({ id, type: "result", payload: result });
  } catch (err) {
    ctx.postMessage({
      id,
      type: "error",
      message: err instanceof Error ? err.message : "Unknown processing error",
    });
  }
};

export {};
