"use client";

import { useState } from "react";
import { MailCheck, Send } from "lucide-react";
import { PRESET_REQUEST_EMAIL } from "@/lib/site";
import { track } from "@/lib/analytics";

export function PresetRequestForm() {
  const [examName, setExamName] = useState("");
  const [notificationUrl, setNotificationUrl] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subject = `Preset request: ${examName}`;
    const body = [
      `Exam name: ${examName}`,
      `Notification link: ${notificationUrl || "(not provided)"}`,
    ].join("\n");
    const mailtoUrl = `mailto:${PRESET_REQUEST_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    track({ name: "preset_request_submitted" });
    window.location.href = mailtoUrl;
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-card dark:border-white/10 dark:bg-white/[0.03]">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
          <MailCheck className="h-5 w-5" />
        </span>
        <p className="max-w-sm text-sm text-slate-600 dark:text-slate-300">
          Your email app should have opened with the details filled in — just hit send. If nothing
          opened, email us directly at{" "}
          <a
            href={`mailto:${PRESET_REQUEST_EMAIL}`}
            className="font-medium text-brand-600 underline dark:text-brand-300"
          >
            {PRESET_REQUEST_EMAIL}
          </a>{" "}
          with the exam name and a link to its notification.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-1 text-sm font-medium text-brand-600 underline dark:text-brand-300"
        >
          Request another exam
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-card dark:border-white/10 dark:bg-white/[0.03] sm:p-8"
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
        Exam name
        <input
          type="text"
          required
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          placeholder="e.g. MPPSC State Service Exam"
          className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal text-slate-900 focus:border-brand-300 focus:outline-none dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
        Link to the official notification (optional, but helps a lot)
        <input
          type="url"
          value={notificationUrl}
          onChange={(e) => setNotificationUrl(e.target.value)}
          placeholder="https://..."
          className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal text-slate-900 focus:border-brand-300 focus:outline-none dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
        />
      </label>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        We only need the exam name and notification link — no personal details, please.
      </p>
      <button
        type="submit"
        className="inline-flex items-center gap-2 self-start rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-medium text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <Send className="h-4 w-4" />
        Send request
      </button>
    </form>
  );
}
