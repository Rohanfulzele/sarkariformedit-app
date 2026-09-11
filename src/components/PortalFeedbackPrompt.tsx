"use client";

import { useState, useSyncExternalStore } from "react";
import { MessageCircleQuestion, X } from "lucide-react";
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
    <div className="flex flex-col gap-3 rounded-2xl border border-brand-100 bg-brand-50/70 p-4 text-sm dark:border-brand-400/20 dark:bg-brand-400/10 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2.5">
        <MessageCircleQuestion className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" />
        <span className="text-slate-700 dark:text-slate-200">
          Quick one — did the {documentType} you made here for {examName} get accepted?
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => respond(true)}
          className="rounded-full bg-brand-gradient px-3.5 py-1.5 text-xs font-medium text-white shadow-glow"
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => respond(false)}
          className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
        >
          No
        </button>
        <button
          type="button"
          onClick={() => respond(null)}
          aria-label="Dismiss"
          className="rounded-full p-1.5 text-slate-400 hover:bg-white/60 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-slate-300"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
