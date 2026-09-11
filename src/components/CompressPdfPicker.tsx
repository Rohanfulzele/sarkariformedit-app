"use client";

import { useState } from "react";
import { CompressPdfTool } from "./CompressPdfTool";

const QUICK_TARGETS = [100, 200, 500, 1024];

export function CompressPdfPicker() {
  const [targetKB, setTargetKB] = useState(200);
  const [customValue, setCustomValue] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {QUICK_TARGETS.map((kb) => (
          <button
            key={kb}
            type="button"
            onClick={() => {
              setTargetKB(kb);
              setCustomValue("");
            }}
            className={
              targetKB === kb && !customValue
                ? "rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white"
                : "rounded-full border border-slate-300 px-4 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            }
          >
            {kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`}
          </button>
        ))}
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          Custom:
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
            className="w-24 rounded-lg border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
      </div>

      <CompressPdfTool key={targetKB} targetKB={targetKB} />
    </div>
  );
}
