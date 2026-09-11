import type { Metadata } from "next";
import { CompressPdfLanding } from "@/components/CompressPdfLanding";

export const metadata: Metadata = {
  title: "Compress PDF to 100KB",
  description:
    "Shrink a PDF to under 100KB for portals with strict upload limits. Processed entirely in your browser.",
};

export default function CompressPdf100kbPage() {
  return <CompressPdfLanding targetKB={100} label="100 KB" />;
}
