import Link from "next/link";

const NAV_LINKS = [
  { href: "/pdf-tools", label: "PDF tools" },
  { href: "/custom", label: "Custom size" },
  { href: "/request-preset", label: "Request exam" },
  { href: "/privacy", label: "Privacy" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-[#08080f]/80">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3.5 sm:flex-nowrap sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-gradient shadow-glow transition-transform group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
            SarkariFormEdit
          </span>
        </Link>
        <nav className="flex w-full flex-wrap items-center gap-x-0.5 gap-y-1 text-sm text-slate-600 dark:text-slate-300 sm:w-auto sm:justify-end">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-full px-3 py-1.5 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
