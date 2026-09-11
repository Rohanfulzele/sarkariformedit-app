import type { Metadata } from "next";
import { CompressPdfLanding } from "@/components/CompressPdfLanding";

export const metadata: Metadata = {
  title: "Compress PDF to 1MB",
  description: "Shrink a PDF to under 1MB. Processed entirely in your browser.",
};

export default function CompressPdf1mbPage() {
  return <CompressPdfLanding targetKB={1024} label="1 MB" />;
}
