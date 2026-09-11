"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { ToolFlowLazy } from "@/components/ToolFlowLazy";
import { track } from "@/lib/analytics";
import type { ToolSpec } from "@/lib/tool-spec";
import type { DocumentKind, OutputFormat } from "@/engine";

const DEFAULTS = {
  widthPx: 200,
  heightPx: 230,
  minKB: 20,
  maxKB: 50,
  format: "jpeg" as OutputFormat,
  documentType: "photo" as DocumentKind,
};

const inputClass =
  "rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal text-slate-900 focus:border-brand-300 focus:outline-none dark:border-white/10 dark:bg-white/[0.03] dark:text-white";

export function CustomModeForm() {
  const [form, setForm] = useState(DEFAULTS);
  const [spec, setSpec] = useState<ToolSpec | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSpec: ToolSpec = {
      id: "custom",
      documentType: form.documentType,
      widthPx: form.widthPx,
      heightPx: form.heightPx,
      minKB: form.minKB,
      maxKB: form.maxKB,
      format: form.format,
    };
    setSpec(newSpec);
    track({ name: "custom_mode_started" });
  };

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-card dark:border-white/10 dark:bg-white/[0.03] sm:grid-cols-4 sm:p-8"
      >
        <label className="col-span-1 flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
          Width (px)
          <input
            type="number"
            min={1}
            required
            value={form.widthPx}
            onChange={(e) => setForm({ ...form, widthPx: Number(e.target.value) })}
            className={inputClass}
          />
        </label>
        <label className="col-span-1 flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
          Height (px)
          <input
            type="number"
            min={1}
            required
            value={form.heightPx}
            onChange={(e) => setForm({ ...form, heightPx: Number(e.target.value) })}
            className={inputClass}
          />
        </label>
        <label className="col-span-1 flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
          Min size (KB)
          <input
            type="number"
            min={1}
            required
            value={form.minKB}
            onChange={(e) => setForm({ ...form, minKB: Number(e.target.value) })}
            className={inputClass}
          />
        </label>
        <label className="col-span-1 flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
          Max size (KB)
          <input
            type="number"
            min={1}
            required
            value={form.maxKB}
            onChange={(e) => setForm({ ...form, maxKB: Number(e.target.value) })}
            className={inputClass}
          />
        </label>
        <label className="col-span-1 flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
          Document type
          <select
            value={form.documentType}
            onChange={(e) => setForm({ ...form, documentType: e.target.value as DocumentKind })}
            className={inputClass}
          >
            <option value="photo">Photo</option>
            <option value="signature">Signature</option>
            <option value="thumb_impression">Thumb impression</option>
            <option value="declaration">Declaration</option>
          </select>
        </label>
        <label className="col-span-1 flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
          Format
          <select
            value={form.format}
            onChange={(e) => setForm({ ...form, format: e.target.value as OutputFormat })}
            className={inputClass}
          >
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
          </select>
        </label>

        <div className="col-span-full">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-medium text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4" />
            Use these settings
          </button>
        </div>
      </form>

      {spec && (
        <ToolFlowLazy
          key={`${spec.widthPx}x${spec.heightPx}-${spec.minKB}-${spec.maxKB}-${spec.format}-${spec.documentType}`}
          spec={spec}
          downloadFileName={`custom.${spec.format === "jpeg" ? "jpg" : "png"}`}
        />
      )}
    </div>
  );
}
