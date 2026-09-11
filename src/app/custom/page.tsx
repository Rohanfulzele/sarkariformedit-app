import type { Metadata } from "next";
import { CustomModeForm } from "@/components/CustomModeForm";

export const metadata: Metadata = {
  title: "Custom Size",
  description:
    "Enter the exact pixel dimensions and file-size range from your notification to resize a photo, signature, or document for any exam not yet in our preset list.",
};

export default function CustomModePage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Custom size
        </h1>
        <p className="max-w-2xl text-slate-600 dark:text-slate-300">
          Can&apos;t find your exam in the list? Enter the exact requirements from your
          notification and use the same resize tool.
        </p>
      </section>

      <CustomModeForm />
    </div>
  );
}
