import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
        <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-200">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          Everything processes on your device — your files are never uploaded anywhere.
        </div>

        <div className="flex flex-col gap-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          <p>
            SarkariFormEdit is an independent tool and is not affiliated with, endorsed by, or
            connected to any government body, exam conducting authority, or recruitment board.
            Preset specifications are provided as a convenience — always confirm dimensions, file
            size, and format against your exam&apos;s official notification before submitting your
            application.
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
          <span>© 2026 SarkariFormEdit</span>
          <Link href="/privacy" className="font-medium hover:text-brand dark:hover:text-brand-300">
            Privacy policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
