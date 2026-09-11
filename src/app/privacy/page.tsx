import type { Metadata } from "next";
import { BarChart3, HelpCircle, ShieldCheck, UserX } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SarkariFormEdit handles your photos, signatures, and documents.",
};

const SECTIONS = [
  {
    icon: ShieldCheck,
    title: "Your files never leave your device",
    body: "Every photo, signature, and PDF you process on SarkariFormEdit — resizing, cropping, compressing, merging, converting — happens entirely inside your own browser. At no point is the image or document content sent to any server — there is no upload step, no server-side processing, and no storage of your files anywhere. You can verify this yourself: open your browser's network inspector while using the tool and you'll see zero requests carrying image or file data.",
  },
  {
    icon: BarChart3,
    title: "What we do collect",
    body: "We use privacy-respecting, cookieless analytics to understand which presets are used and where people get stuck (for example: which preset was selected, whether a file was processed successfully, and whether the result passed validation). These events never include your name, your files, filenames, or any text you type into the tool, such as a name/date strip.",
  },
  {
    icon: UserX,
    title: "No accounts",
    body: "SarkariFormEdit does not require sign-up, does not store accounts, and does not retain any document you process after you close or refresh the page.",
  },
  {
    icon: HelpCircle,
    title: "Questions",
    body: "SarkariFormEdit is an independent project and is not affiliated with any government body or exam conducting authority.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        Privacy policy
      </h1>

      <div className="flex flex-col gap-8">
        {SECTIONS.map(({ icon: Icon, title, body }) => (
          <section key={title} className="flex gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-400/10 dark:text-brand-300">
              <Icon className="h-4 w-4" />
            </span>
            <div className="flex flex-col gap-1.5">
              <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{body}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
