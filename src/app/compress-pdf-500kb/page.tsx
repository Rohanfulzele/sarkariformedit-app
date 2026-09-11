import type { Metadata } from "next";
import { CompressPdfLanding } from "@/components/CompressPdfLanding";

export const metadata: Metadata = {
  title: "Compress PDF to 500KB",
  description:
    "Shrink a PDF to under 500KB for portals and email attachment limits. Processed entirely in your browser.",
};

export default function CompressPdf500kbPage() {
  return <CompressPdfLanding targetKB={500} label="500 KB" />;
}
