"use client";

import dynamic from "next/dynamic";

export const ToolFlowLazy = dynamic(
  () => import("./ToolFlow").then((mod) => mod.ToolFlow),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[300px] animate-pulse items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-400 shadow-card dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-500">
        Loading tool…
      </div>
    ),
  }
);
