"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { searchPresets, type Preset } from "@presets";

const DOCUMENT_TYPE_LABEL: Record<Preset["documentType"], string> = {
  photo: "Photo",
  signature: "Signature",
  thumb_impression: "Thumb impression",
  declaration: "Declaration",
};

export function PresetPicker() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchPresets(query), [query]);

  return (
    <div className="flex flex-col gap-4">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search your exam — e.g. SSC CGL, IBPS PO, UPSC"
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((preset) => (
          <Link
            key={preset.id}
            href={`/${preset.id}`}
            className="flex flex-col gap-1 rounded-xl border border-slate-200 p-4 transition hover:border-brand hover:shadow-sm dark:border-slate-800"
          >
            <span className="text-xs font-medium uppercase tracking-wide text-brand dark:text-blue-400">
              {DOCUMENT_TYPE_LABEL[preset.documentType]}
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{preset.examName}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {preset.dimensions.widthPx}×{preset.dimensions.heightPx}px · {preset.fileSizeKB.min}–
              {preset.fileSizeKB.max} KB
            </span>
          </Link>
        ))}

        {results.length === 0 && (
          <p className="col-span-full text-sm text-slate-500 dark:text-slate-400">
            No preset found for &ldquo;{query}&rdquo; yet.{" "}
            <Link href="/custom" className="text-brand underline dark:text-blue-400">
              Use custom mode
            </Link>{" "}
            or let us know which exam to add.
          </p>
        )}
      </div>
    </div>
  );
}
