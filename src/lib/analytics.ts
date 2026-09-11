/**
 * Cookieless, privacy-respecting event tracking. Every event name and its
 * allowed props are typed here on purpose: it's the one place that could leak
 * personal data, so it should be impossible to pass a filename, entered name,
 * or file content through this function by accident (see PRD C3 / A8).
 */
type AnalyticsEvent =
  | { name: "preset_selected"; presetId: string }
  | { name: "custom_mode_started" }
  | { name: "file_added"; presetId: string; documentType: string }
  | { name: "processed"; presetId: string; durationMs: number }
  | { name: "validated"; presetId: string; passed: boolean }
  | { name: "downloaded"; presetId: string }
  | { name: "error"; presetId: string; errorType: string }
  | { name: "portal_feedback"; presetId: string; accepted: boolean }
  | { name: "preset_request_submitted" };

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, string | number | boolean> }) => void;
  }
}

export function track(event: AnalyticsEvent): void {
  const { name, ...props } = event;

  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", name, props);
  }

  if (typeof window !== "undefined" && typeof window.plausible === "function") {
    window.plausible(name, { props });
  }
}
