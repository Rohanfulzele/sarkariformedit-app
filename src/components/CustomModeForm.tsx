"use client";

import { useState } from "react";
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
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 p-6 dark:border-slate-800 sm:grid-cols-4">
        <label className="col-span-1 flex flex-col gap-1 text-sm">
          Width (px)
          <input
            type="number"
            min={1}
            required
            value={form.widthPx}
            onChange={(e) => setForm({ ...form, widthPx: Number(e.target.value) })}
            className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="col-span-1 flex flex-col gap-1 text-sm">
          Height (px)
          <input
            type="number"
            min={1}
            required
            value={form.heightPx}
            onChange={(e) => setForm({ ...form, heightPx: Number(e.target.value) })}
            className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="col-span-1 flex flex-col gap-1 text-sm">
          Min size (KB)
          <input
            type="number"
            min={1}
            required
            value={form.minKB}
            onChange={(e) => setForm({ ...form, minKB: Number(e.target.value) })}
            className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="col-span-1 flex flex-col gap-1 text-sm">
          Max size (KB)
          <input
            type="number"
            min={1}
            required
            value={form.maxKB}
            onChange={(e) => setForm({ ...form, maxKB: Number(e.target.value) })}
            className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="col-span-1 flex flex-col gap-1 text-sm">
          Document type
          <select
            value={form.documentType}
            onChange={(e) => setForm({ ...form, documentType: e.target.value as DocumentKind })}
            className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="photo">Photo</option>
            <option value="signature">Signature</option>
            <option value="thumb_impression">Thumb impression</option>
            <option value="declaration">Declaration</option>
          </select>
        </label>
        <label className="col-span-1 flex flex-col gap-1 text-sm">
          Format
          <select
            value={form.format}
            onChange={(e) => setForm({ ...form, format: e.target.value as OutputFormat })}
            className="rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
          </select>
        </label>

        <div className="col-span-full">
          <button
            type="submit"
            className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
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
