"use client";

import { useState } from "react";
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
      <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
        <p>
          Your email app should have opened with the details filled in — just hit send. If nothing
          opened, email us directly at{" "}
          <a href={`mailto:${PRESET_REQUEST_EMAIL}`} className="text-brand underline dark:text-blue-400">
            {PRESET_REQUEST_EMAIL}
          </a>{" "}
          with the exam name and a link to its notification.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-4 text-sm text-brand underline dark:text-blue-400"
        >
          Request another exam
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-slate-200 p-6 dark:border-slate-800"
    >
      <label className="flex flex-col gap-1 text-sm">
        Exam name
        <input
          type="text"
          required
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          placeholder="e.g. MPPSC State Service Exam"
          className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Link to the official notification (optional, but helps a lot)
        <input
          type="url"
          value={notificationUrl}
          onChange={(e) => setNotificationUrl(e.target.value)}
          placeholder="https://..."
          className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
        />
      </label>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        We only need the exam name and notification link — no personal details, please.
      </p>
      <button
        type="submit"
        className="self-start rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark"
      >
        Send request
      </button>
    </form>
  );
}
