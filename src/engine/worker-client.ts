import type {
  ProcessImageRequest,
  ProcessImageResult,
  WorkerRequestMessage,
  WorkerResponseMessage,
} from "./types";

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<
  string,
  { resolve: (r: ProcessImageResult) => void; reject: (e: Error) => void }
>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./worker.ts", import.meta.url));
    worker.onmessage = (event: MessageEvent<WorkerResponseMessage>) => {
      const { id } = event.data;
      const handlers = pending.get(id);
      if (!handlers) return;
      pending.delete(id);

      if (event.data.type === "result") {
        handlers.resolve(event.data.payload);
      } else {
        handlers.reject(new Error(event.data.message));
      }
    };
  }
  return worker;
}

export function processImageInWorker(
  request: ProcessImageRequest
): Promise<ProcessImageResult> {
  return new Promise((resolve, reject) => {
    const id = String(nextId++);
    pending.set(id, { resolve, reject });

    const message: WorkerRequestMessage = { id, type: "process", payload: request };
    getWorker().postMessage(message, [request.fileBuffer]);
  });
}
