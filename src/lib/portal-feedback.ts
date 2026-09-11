/**
 * Backs the PRD's A16 "was it accepted?" prompt. Everything here is
 * localStorage-only and per-device — there is no server to record downloads
 * against, and the prompt is deliberately shown on a *return* visit (not
 * immediately after download) so it's asking about a real portal outcome.
 */
const DOWNLOAD_KEY_PREFIX = "formready:download:";
const FEEDBACK_KEY_PREFIX = "formready:feedback:";
const RETURN_VISIT_THRESHOLD_MS = 60 * 60 * 1000;

export function recordDownload(presetId: string): void {
  try {
    localStorage.setItem(`${DOWNLOAD_KEY_PREFIX}${presetId}`, String(Date.now()));
  } catch {
    // localStorage unavailable (private browsing, blocked storage) — skip silently.
  }
}

export function shouldShowFeedbackPrompt(presetId: string): boolean {
  try {
    const downloadedAt = localStorage.getItem(`${DOWNLOAD_KEY_PREFIX}${presetId}`);
    if (!downloadedAt) return false;
    if (localStorage.getItem(`${FEEDBACK_KEY_PREFIX}${presetId}`)) return false;
    return Date.now() - Number(downloadedAt) > RETURN_VISIT_THRESHOLD_MS;
  } catch {
    return false;
  }
}

export function recordFeedbackGiven(presetId: string): void {
  try {
    localStorage.setItem(`${FEEDBACK_KEY_PREFIX}${presetId}`, "1");
  } catch {
    // ignore
  }
}
