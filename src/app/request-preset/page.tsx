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
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Request an exam preset
        </h1>
        <p className="max-w-2xl text-slate-600 dark:text-slate-300">
          Don&apos;t see your exam in the list? Send us the exam name and a link to the official
          notification, and we&apos;ll add it. In the meantime, you can enter the requirements
          yourself in{" "}
          <Link href="/custom" className="font-medium text-brand-600 underline dark:text-brand-300">
            custom mode
          </Link>
          .
        </p>
      </section>

      <PresetRequestForm />
    </div>
  );
}
