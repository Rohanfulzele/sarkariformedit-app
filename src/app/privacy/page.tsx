import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How FormReady handles your photos, signatures, and documents.",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
        Privacy policy
      </h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Your files never leave your device
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Every photo, signature, and PDF you process on FormReady is resized, cropped, and
          compressed entirely inside your own browser using the Canvas API and Web Workers. At no
          point is the image or document content sent to any server — there is no upload step, no
          server-side processing, and no storage of your files anywhere. You can verify this
          yourself: open your browser&apos;s network inspector while using the tool and you&apos;ll
          see zero requests carrying image or file data.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          What we do collect
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          We use privacy-respecting, cookieless analytics to understand which presets are used and
          where people get stuck (for example: which preset was selected, whether a file was
          processed successfully, and whether the result passed validation). These events never
          include your name, your files, filenames, or any text you type into the tool, such as a
          name/date strip.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No accounts</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          FormReady does not require sign-up, does not store accounts, and does not retain any
          document you process after you close or refresh the page.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Questions</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          FormReady is an independent project and is not affiliated with any government body or
          exam conducting authority.
        </p>
      </section>
    </div>
  );
}
