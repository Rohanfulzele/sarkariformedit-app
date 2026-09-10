import type { Preset } from "@presets";

export function buildPresetFaq(preset: Preset): { q: string; a: string }[] {
  const { examName, documentType, dimensions, fileSizeKB, background } = preset;
  const docLabel = documentType === "thumb_impression" ? "thumb impression" : documentType;

  const faq: { q: string; a: string }[] = [
    {
      q: `What size does my ${examName} ${docLabel} need to be?`,
      a: `${dimensions.widthPx}×${dimensions.heightPx} pixels${
        dimensions.physical
          ? ` (roughly ${dimensions.physical.widthCm}cm × ${dimensions.physical.heightCm}cm at ${dimensions.physical.dpi} DPI)`
          : ""
      }, between ${fileSizeKB.min} KB and ${fileSizeKB.max} KB, in ${preset.formats
        .map((f) => f.toUpperCase())
        .join(" or ")} format.`,
    },
    {
      q: "Why does the portal reject my file even though it looks fine?",
      a: `Most portals check exact pixel dimensions and a strict file-size range, not just "looks like a photo." A file that's visually fine but is, say, 800×600px or 180 KB will be rejected if the requirement is ${dimensions.widthPx}×${dimensions.heightPx}px and ${fileSizeKB.min}–${fileSizeKB.max} KB. FormReady resizes and compresses to hit both exactly.`,
    },
  ];

  if (background.requirement !== "any") {
    faq.push({
      q: `Does the background need to be a specific colour?`,
      a: `Yes — ${
        background.description ??
        `a ${background.requirement === "white" ? "white" : "plain, light-coloured"} background is required`
      }. If your photo has a patterned wall or shadow behind you, retake it against a plain surface for the best result.`,
    });
  }

  if (documentType === "signature") {
    faq.push({
      q: "Can I just take a photo of my signature on paper?",
      a: "Yes. Sign in black or dark blue ink on plain white paper, photograph it in good light, and FormReady will crop tightly to your signature and clean up the background to a crisp white — similar to a scan.",
    });
  }

  if (documentType === "photo") {
    faq.push({
      q: "Can I use an old photo?",
      a: "Most exam notifications require a recent photograph (commonly taken within the last few months) and prohibit sunglasses, caps, or heavy filters. Check your specific notification for the exact recency rule, since this varies by exam and cycle.",
    });
  }

  if (preset.nameDateStrip.required) {
    faq.push({
      q: "Do I need to write my name and date on the photo?",
      a: `Yes, this exam's format requires a name/date strip on the photo itself${
        preset.nameDateStrip.format ? ` (${preset.nameDateStrip.format})` : ""
      }. Enter the text when prompted and FormReady will add it within the required dimensions.`,
    });
  }

  faq.push({
    q: "Is this the official exam website?",
    a: `No. FormReady is an independent tool and is not affiliated with the organisation that conducts ${examName}. Always cross-check these specifications against your official notification, especially if it's been a while since this preset was last verified.`,
  });

  return faq;
}
