"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Fingerprint, ImageIcon, PenLine, ScrollText, Search } from "lucide-react";
import { searchPresets, type Preset } from "@presets";

const DOCUMENT_TYPE_LABEL: Record<Preset["documentType"], string> = {
  photo: "Photo",
  signature: "Signature",
  thumb_impression: "Thumb impression",
  declaration: "Declaration",
};

const DOCUMENT_TYPE_ICON: Record<Preset["documentType"], typeof ImageIcon> = {
  photo: ImageIcon,
  signature: PenLine,
  thumb_impression: Fingerprint,
  declaration: ScrollText,
};

export function PresetPicker() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchPresets(query), [query]);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your exam — e.g. SSC CGL, IBPS PO, UPSC"
          className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 shadow-soft transition-shadow placeholder:text-slate-400 focus:border-brand-300 focus:shadow-card focus:outline-none dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-slate-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((preset) => {
          const Icon = DOCUMENT_TYPE_ICON[preset.documentType];
          return (
            <Link
              key={preset.id}
              href={`/${preset.id}`}
              className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-brand-400/30"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-400/10 dark:text-brand-300">
                  <Icon className="h-4 w-4" />
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 dark:text-slate-600" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium uppercase tracking-wide text-brand-600 dark:text-brand-300">
                  {DOCUMENT_TYPE_LABEL[preset.documentType]}
                </span>
                <span className="font-medium leading-snug text-slate-900 dark:text-white">
                  {preset.examName}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {preset.dimensions.widthPx}×{preset.dimensions.heightPx}px · {preset.fileSizeKB.min}–
                  {preset.fileSizeKB.max} KB
                </span>
              </div>
            </Link>
          );
        })}

        {results.length === 0 && (
          <p className="col-span-full rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
            No preset found for &ldquo;{query}&rdquo; yet.{" "}
            <Link href="/custom" className="font-medium text-brand-600 underline dark:text-brand-300">
              Use custom mode
            </Link>{" "}
            or{" "}
            <Link
              href="/request-preset"
              className="font-medium text-brand-600 underline dark:text-brand-300"
            >
              let us know which exam to add
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
