import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SarkariFormEdit — Exam Photo & Signature Resizer",
    template: "%s | SarkariFormEdit",
  },
  description:
    "Resize your photo and signature to exact exam portal specs, free, and entirely in your browser. No uploads, no cyber café needed.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a12" },
  ],
};

// Unset until the domain (PRD Q6) is final. Once SarkariFormEdit is live at its real
// domain, set NEXT_PUBLIC_PLAUSIBLE_DOMAIN and this script switches on with no
// code change — cookieless, no consent banner needed (see privacy policy).
const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-white font-sans text-slate-900 antialiased dark:bg-[#08080f] dark:text-slate-100">
        {plausibleDomain && (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
        <RegisterServiceWorker />
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
