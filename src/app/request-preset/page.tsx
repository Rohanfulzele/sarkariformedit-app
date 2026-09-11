import type { Metadata } from "next";
import Link from "next/link";
import { PresetRequestForm } from "@/components/PresetRequestForm";

export const metadata: Metadata = {
  title: "Request an Exam Preset",
  description:
    "Can't find your exam? Tell us the exam name and a link to its official notification so we can add a preset for it.",
};

export default function RequestPresetPage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
          Request an exam preset
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Don&apos;t see your exam in the list? Send us the exam name and a link to the official
          notification, and we&apos;ll add it. In the meantime, you can enter the requirements
          yourself in{" "}
          <Link href="/custom" className="text-brand underline dark:text-blue-400">
            custom mode
          </Link>
          .
        </p>
      </section>

      <PresetRequestForm />
    </div>
  );
}
