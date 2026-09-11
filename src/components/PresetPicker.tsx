"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Fingerprint, ImageIcon, PenLine, ScrollText } from "lucide-react";
import { Select } from "@/components/Select";
import { getAllPresets, type DocumentType, type Preset } from "@presets";

const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  photo: "Photo",
  signature: "Signature",
  thumb_impression: "Thumb impression",
  declaration: "Declaration",
};

const DOCUMENT_TYPE_ICON: Record<DocumentType, typeof ImageIcon> = {
  photo: ImageIcon,
  signature: PenLine,
  thumb_impression: Fingerprint,
  declaration: ScrollText,
};

// Fixed display order so the document-type dropdown reads the same way for
// every exam, regardless of the order presets happen to be defined in.
const DOCUMENT_TYPE_ORDER: DocumentType[] = ["photo", "signature", "thumb_impression", "declaration"];

interface ExamGroup {
  examName: string;
  presets: Preset[];
}

export function PresetPicker() {
  const examGroups = useMemo<ExamGroup[]>(() => {
    const byExam = new Map<string, Preset[]>();
    for (const preset of getAllPresets()) {
      const existing = byExam.get(preset.examName);
      if (existing) existing.push(preset);
      else byExam.set(preset.examName, [preset]);
    }
    return Array.from(byExam.entries())
      .map(([examName, presets]) => ({
        examName,
        presets: [...presets].sort(
          (a, b) => DOCUMENT_TYPE_ORDER.indexOf(a.documentType) - DOCUMENT_TYPE_ORDER.indexOf(b.documentType)
        ),
      }))
      .sort((a, b) => a.examName.localeCompare(b.examName));
  }, []);

  const [examName, setExamName] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType | "">("");

  const selectedExam = examGroups.find((group) => group.examName === examName);

  // Most exams only ever need one document type — skip making the user pick
  // from a dropdown with a single option in it.
  const handleExamChange = (value: string) => {
    setExamName(value);
    const group = examGroups.find((g) => g.examName === value);
    const [onlyPreset] = group?.presets ?? [];
    setDocumentType(group?.presets.length === 1 && onlyPreset ? onlyPreset.documentType : "");
  };

  const preset = selectedExam?.presets.find((p) => p.documentType === documentType);
  const PreviewIcon = preset ? DOCUMENT_TYPE_ICON[preset.documentType] : null;

  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-card dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
          Select your exam
          <Select
            value={examName}
            onChange={handleExamChange}
            options={examGroups.map((group) => ({ value: group.examName, label: group.examName }))}
            placeholder="Choose an exam…"
            aria-label="Select your exam"
          />
        </div>
        <div className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
          Select document type
          <Select
            value={documentType}
            onChange={setDocumentType}
            options={(selectedExam?.presets ?? []).map((p) => ({
              value: p.documentType,
              label: DOCUMENT_TYPE_LABEL[p.documentType],
            }))}
            placeholder={selectedExam ? "Choose a document type…" : "Pick an exam first"}
            disabled={!selectedExam}
            aria-label="Select document type"
          />
        </div>
      </div>

      {preset && PreviewIcon && (
        <Link
          href={`/${preset.id}`}
          className="group flex flex-col items-start justify-between gap-4 rounded-2xl border border-brand-200 bg-brand-50/60 p-4 transition-colors hover:bg-brand-50 dark:border-brand-400/20 dark:bg-brand-400/10 dark:hover:bg-brand-400/15 sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-soft dark:bg-white/10 dark:text-brand-300">
              <PreviewIcon className="h-5 w-5" />
            </span>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900 dark:text-white">
                {DOCUMENT_TYPE_LABEL[preset.documentType]} for {preset.examName}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {preset.dimensions.widthPx}×{preset.dimensions.heightPx}px · {preset.fileSizeKB.min}–
                {preset.fileSizeKB.max} KB
              </span>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 self-stretch justify-center rounded-full bg-brand-gradient px-4 py-2 text-sm font-medium text-white shadow-glow transition-transform group-hover:scale-[1.02] sm:self-auto">
            Open tool
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Can&apos;t find your exam?{" "}
        <Link href="/custom" className="font-medium text-brand-600 underline dark:text-brand-300">
          Use custom mode
        </Link>{" "}
        or{" "}
        <Link href="/request-preset" className="font-medium text-brand-600 underline dark:text-brand-300">
          let us know which exam to add
        </Link>
        .
      </p>
    </div>
  );
}
