"use client";

import { useState, useSyncExternalStore } from "react";
import { recordFeedbackGiven, shouldShowFeedbackPrompt } from "@/lib/portal-feedback";
import { track } from "@/lib/analytics";

interface PortalFeedbackPromptProps {
  presetId: string;
  examName: string;
  documentType: string;
}

const noopSubscribe = () => () => {};
const serverSnapshot = () => false;

export function PortalFeedbackPrompt({ presetId, examName, documentType }: PortalFeedbackPromptProps) {
  // localStorage doesn't exist during static generation — useSyncExternalStore reads it
  // safely once mounted in the browser without the setState-in-effect anti-pattern.
  const eligible = useSyncExternalStore(
    noopSubscribe,
    () => shouldShowFeedbackPrompt(presetId),
    serverSnapshot
  );
  const [dismissed, setDismissed] = useState(false);

  if (!eligible || dismissed) return null;

  const respond = (accepted: boolean | null) => {
    if (accepted !== null) {
      track({ name: "portal_feedback", presetId, accepted });
    }
    recordFeedbackGiven(presetId);
    setDismissed(true);
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-900 dark:bg-blue-950/40 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-slate-700 dark:text-slate-200">
        Quick one — did the {documentType} you made here for {examName} get accepted?
      </span>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => respond(true)}
          className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark"
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => respond(false)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          No
        </button>
        <button
          type="button"
          onClick={() => respond(null)}
          aria-label="Dismiss"
          className="rounded-lg px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
