import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          FormReady
        </Link>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
          <Link href="/pdf-tools" className="hover:text-brand dark:hover:text-blue-400">
            PDF tools
          </Link>
          <Link href="/custom" className="hover:text-brand dark:hover:text-blue-400">
            Custom size
          </Link>
          <Link href="/request-preset" className="hover:text-brand dark:hover:text-blue-400">
            Request exam
          </Link>
          <Link href="/privacy" className="hover:text-brand dark:hover:text-blue-400">
            Privacy
          </Link>
        </nav>
      </div>
    </header>
  );
}
