import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-xs text-slate-500 dark:text-slate-400">
        <p>
          FormReady is an independent tool and is not affiliated with, endorsed by, or connected
          to any government body, exam conducting authority, or recruitment board. Preset
          specifications are provided as a convenience — always confirm dimensions, file size, and
          format against your exam&apos;s official notification before submitting your application.
        </p>
        <p>
          All processing happens in your browser. Your photos, signatures, and documents are never
          uploaded to any server.
        </p>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-brand dark:hover:text-blue-400">
            Privacy policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
