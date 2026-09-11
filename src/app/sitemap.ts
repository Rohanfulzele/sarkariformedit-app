import type { MetadataRoute } from "next";
import { getAllPresets } from "@presets";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = ["", "/custom", "/privacy", "/request-preset"].map((path) => ({
    url: `${SITE_URL}${path}`,
  }));

  const presetRoutes: MetadataRoute.Sitemap = getAllPresets().map((preset) => ({
    url: `${SITE_URL}/${preset.id}`,
    lastModified: preset.lastVerifiedDate,
  }));

  return [...staticRoutes, ...presetRoutes];
}
