"use client";

import { useState } from "react";
import { CompressPdfTool } from "./CompressPdfTool";

const QUICK_TARGETS = [100, 200, 500, 1024];

export function CompressPdfPicker() {
  const [targetKB, setTargetKB] = useState(200);
  const [customValue, setCustomValue] = useState("");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        {QUICK_TARGETS.map((kb) => {
          const active = targetKB === kb && !customValue;
          return (
            <button
              key={kb}
              type="button"
              onClick={() => {
                setTargetKB(kb);
                setCustomValue("");
              }}
              className={
                active
                  ? "rounded-full bg-brand-gradient px-4 py-2 text-sm font-medium text-white shadow-glow"
                  : "rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
              }
            >
              {kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`}
            </button>
          );
        })}
        <label className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-4 pr-1.5 text-sm text-slate-600 dark:border-white/10 dark:text-slate-300">
          Custom
          <input
            type="number"
            min={1}
            placeholder="KB"
            value={customValue}
            onChange={(e) => {
              setCustomValue(e.target.value);
              const value = Number(e.target.value);
              if (value > 0) setTargetKB(value);
            }}
            className="w-16 rounded-full bg-slate-100 px-2.5 py-1 text-slate-900 focus:outline-none dark:bg-white/10 dark:text-white"
          />
        </label>
      </div>

      <CompressPdfTool key={targetKB} targetKB={targetKB} />
    </div>
  );
}
