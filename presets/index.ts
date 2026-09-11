import { presetSchema, type Preset } from "./schema";

import sscCglSignature from "./data/ssc-cgl-signature.json";
import sscChslSignature from "./data/ssc-chsl-signature.json";
import ibpsPoPhoto from "./data/ibps-po-photo.json";
import ibpsPoSignature from "./data/ibps-po-signature.json";
import ibpsPoThumbImpression from "./data/ibps-po-thumb-impression.json";
import ibpsPoDeclaration from "./data/ibps-po-declaration.json";
import ibpsClerkPhoto from "./data/ibps-clerk-photo.json";
import ibpsClerkSignature from "./data/ibps-clerk-signature.json";
import ibpsClerkThumbImpression from "./data/ibps-clerk-thumb-impression.json";
import ibpsClerkDeclaration from "./data/ibps-clerk-declaration.json";
import rrbNtpcSignature from "./data/rrb-ntpc-signature.json";
import rrbGroupDSignature from "./data/rrb-group-d-signature.json";
import upscCsePhoto from "./data/upsc-cse-photo.json";
import upscCseSignature from "./data/upsc-cse-signature.json";
import universityAdmissionPhoto from "./data/university-admission-photo.json";

const rawPresets: unknown[] = [
  sscCglSignature,
  sscChslSignature,
  ibpsPoPhoto,
  ibpsPoSignature,
  ibpsPoThumbImpression,
  ibpsPoDeclaration,
  ibpsClerkPhoto,
  ibpsClerkSignature,
  ibpsClerkThumbImpression,
  ibpsClerkDeclaration,
  rrbNtpcSignature,
  rrbGroupDSignature,
  upscCsePhoto,
  upscCseSignature,
  universityAdmissionPhoto,
];

function loadPresets(): Preset[] {
  const parsed: Preset[] = [];
  const seenIds = new Set<string>();

  for (const raw of rawPresets) {
    const result = presetSchema.safeParse(raw);
    if (!result.success) {
      throw new Error(
        `Invalid preset data: ${result.error.issues.map((i) => i.message).join(", ")}`
      );
    }
    if (seenIds.has(result.data.id)) {
      throw new Error(`Duplicate preset id: ${result.data.id}`);
    }
    seenIds.add(result.data.id);
    parsed.push(result.data);
  }

  return parsed;
}

export const ALL_PRESETS: Preset[] = loadPresets();

export function getAllPresets(): Preset[] {
  return ALL_PRESETS;
}

export function getPresetById(id: string): Preset | undefined {
  return ALL_PRESETS.find((p) => p.id === id);
}

export function getPresetsByCategory(category: Preset["category"]): Preset[] {
  return ALL_PRESETS.filter((p) => p.category === category);
}

export function searchPresets(query: string): Preset[] {
  const q = query.trim().toLowerCase();
  if (!q) return ALL_PRESETS;
  return ALL_PRESETS.filter((p) => {
    const haystack = [p.examName, p.id, ...p.examAliases].join(" ").toLowerCase();
    return haystack.includes(q);
  });
}

export * from "./schema";
