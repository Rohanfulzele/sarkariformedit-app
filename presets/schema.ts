import { z } from "zod";

export const documentTypeSchema = z.enum([
  "photo",
  "signature",
  "thumb_impression",
  "declaration",
]);
export type DocumentType = z.infer<typeof documentTypeSchema>;

export const examCategorySchema = z.enum([
  "ssc",
  "banking",
  "railway",
  "upsc",
  "state-psc",
  "university",
  "other",
]);
export type ExamCategory = z.infer<typeof examCategorySchema>;

export const presetSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "id must be kebab-case")
    .describe("Slug used in the URL, e.g. ssc-cgl-photo"),
  examName: z.string().min(1),
  examAliases: z
    .array(z.string().min(1))
    .default([])
    .describe("Abbreviations/short forms used in search, e.g. 'SSC CGL'"),
  category: examCategorySchema,
  documentType: documentTypeSchema,
  dimensions: z.object({
    widthPx: z.number().int().positive(),
    heightPx: z.number().int().positive(),
    physical: z
      .object({
        widthCm: z.number().positive(),
        heightCm: z.number().positive(),
        dpi: z.number().int().positive(),
      })
      .optional()
      .describe("Informational only; widthPx/heightPx are authoritative for processing"),
  }),
  fileSizeKB: z
    .object({
      min: z.number().positive(),
      max: z.number().positive(),
    })
    .refine((v) => v.max >= v.min, { message: "max must be >= min" }),
  formats: z.array(z.enum(["jpeg", "png"])).min(1),
  background: z.object({
    requirement: z.enum(["white", "light", "any"]),
    description: z.string().optional(),
  }),
  nameDateStrip: z
    .object({
      required: z.boolean(),
      format: z.string().optional(),
      exampleText: z.string().optional(),
    })
    .default({ required: false }),
  officialSourceUrl: z.string().url(),
  lastVerifiedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD"),
  notes: z.string().optional(),
});

export type Preset = z.infer<typeof presetSchema>;

export const STALE_AFTER_DAYS = 120;

export function isPresetStale(preset: Preset, now: Date = new Date()): boolean {
  const verified = new Date(preset.lastVerifiedDate);
  const ageDays = (now.getTime() - verified.getTime()) / (1000 * 60 * 60 * 24);
  return ageDays > STALE_AFTER_DAYS;
}
