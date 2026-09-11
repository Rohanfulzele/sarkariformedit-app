import type { Metadata } from "next";
import { CompressPdfLanding } from "@/components/CompressPdfLanding";

export const metadata: Metadata = {
  title: "Compress PDF to 200KB",
  description:
    "Shrink a PDF to under 200KB, a common upload limit for exam and job portals. Processed entirely in your browser.",
};

export default function CompressPdf200kbPage() {
  return <CompressPdfLanding targetKB={200} label="200 KB" />;
}
