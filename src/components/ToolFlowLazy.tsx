"use client";

import dynamic from "next/dynamic";

export const ToolFlowLazy = dynamic(
  () => import("./ToolFlow").then((mod) => mod.ToolFlow),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
        Loading tool…
      </div>
    ),
  }
);
